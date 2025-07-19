import { ethers } from 'ethers';
import { useGasStore } from '../store/gasStore';

export class UsdPriceService {
  private provider: ethers.WebSocketProvider | null = null;
  private uniswapV3PoolAddress = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'; // ETH/USDC pool
  private updateInterval: NodeJS.Timeout | null = null;

  async initialize() {
    const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_WS;
    if (!rpcUrl) {
      console.error('Ethereum RPC URL not configured');
      return;
    }

    try {
      this.provider = new ethers.WebSocketProvider(rpcUrl);
      await this.provider.getNetwork();
      
      // Initial price fetch
      await this.fetchLatestPrice();
      
      // Set up periodic updates every 30 seconds
      this.updateInterval = setInterval(() => {
        this.fetchLatestPrice();
      }, 30000);
      
      console.log('USD Price Service initialized');
    } catch (error) {
      console.error('Failed to initialize USD Price Service:', error);
    }
  }

  private async fetchLatestPrice() {
    if (!this.provider) return;

    try {
      // Get recent Swap events from Uniswap V3 ETH/USDC pool
      const swapEventSignature = 'Swap(address,address,int256,int256,uint160,uint128,int24)';
      const swapEventTopic = ethers.id(swapEventSignature);
      
      const latestBlock = await this.provider.getBlockNumber();
      const fromBlock = latestBlock - 10; // Look at last 10 blocks
      
      const logs = await this.provider.getLogs({
        address: this.uniswapV3PoolAddress,
        topics: [swapEventTopic],
        fromBlock,
        toBlock: latestBlock,
      });

      if (logs.length > 0) {
        // Get the most recent swap
        const latestLog = logs[logs.length - 1];
        const price = this.calculatePriceFromLog(latestLog);
        
        if (price && price > 0) {
          useGasStore.getState().setUsdPrice(price);
        }
      } else {
        // Fallback: call the pool's slot0 function directly
        await this.fetchPriceFromSlot0();
      }
    } catch (error) {
      console.error('Error fetching USD price:', error);
      // Fallback to slot0 method
      await this.fetchPriceFromSlot0();
    }
  }

  private async fetchPriceFromSlot0() {
    if (!this.provider) return;

    try {
      // Uniswap V3 pool slot0 function ABI
      const poolAbi = [
        'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
      ];
      
      const poolContract = new ethers.Contract(
        this.uniswapV3PoolAddress,
        poolAbi,
        this.provider
      );
      
      const slot0 = await poolContract.slot0();
      const sqrtPriceX96 = slot0[0];
      
      const price = this.calculatePriceFromSqrtPriceX96(sqrtPriceX96);
      
      if (price && price > 0) {
        useGasStore.getState().setUsdPrice(price);
      }
    } catch (error) {
      console.error('Error fetching price from slot0:', error);
    }
  }

  private calculatePriceFromLog(log: ethers.Log): number | null {
    try {
      // Parse the log data
      const swapInterface = new ethers.Interface([
        'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
      ]);
      
      const parsed = swapInterface.parseLog(log);
      if (parsed) {
        const sqrtPriceX96 = parsed.args.sqrtPriceX96;
        return this.calculatePriceFromSqrtPriceX96(sqrtPriceX96);
      }
    } catch (error) {
      console.error('Error parsing swap log:', error);
    }
    return null;
  }

  private calculatePriceFromSqrtPriceX96(sqrtPriceX96: bigint): number {
    try {
      // Convert to BigNumber for precise calculations
      const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
      const price = sqrtPrice * sqrtPrice;
      
      // ETH/USDC price calculation
      // Token0 = USDC (6 decimals), Token1 = ETH (18 decimals)
      // Price = (sqrtPriceX96^2 / 2^192) * (10^token0Decimals / 10^token1Decimals)
      const token0Decimals = 6;  // USDC
      const token1Decimals = 18; // ETH
      const decimalAdjustment = 10 ** (token0Decimals - token1Decimals);
      
      const ethPriceInUsdc = price * decimalAdjustment;
      
      // Convert to ETH/USD (invert the price since we get USDC/ETH)
      const ethPriceInUsd = 1 / ethPriceInUsdc;
      
      return ethPriceInUsd;
    } catch (error) {
      console.error('Error calculating price from sqrtPriceX96:', error);
      return 0;
    }
  }

  disconnect() {
    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider.destroy();
      this.provider = null;
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const usdPriceService = new UsdPriceService();