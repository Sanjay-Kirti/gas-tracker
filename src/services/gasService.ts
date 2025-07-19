import { ethers } from 'ethers';
import { useGasStore, GasPoint } from '../store/gasStore';

export type ChainName = 'ethereum' | 'polygon' | 'arbitrum';

export interface ChainConfig {
  name: ChainName;
  rpcUrl: string;
  chainId: number;
}

export class GasService {
  private providers: Map<ChainName, ethers.WebSocketProvider> = new Map();
  private candlestickIntervals: Map<ChainName, NodeJS.Timeout> = new Map();
  private currentCandles: Map<ChainName, { open: number; high: number; low: number; close: number; startTime: number }> = new Map();
  
  private chains: ChainConfig[] = [
    {
      name: 'ethereum',
      rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_WS || '',
      chainId: 1,
    },
    {
      name: 'polygon',
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_WS || '',
      chainId: 137,
    },
    {
      name: 'arbitrum',
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_WS || '',
      chainId: 42161,
    },
  ];

  async initialize() {
    for (const chain of this.chains) {
      if (chain.rpcUrl) {
        try {
          await this.connectToChain(chain);
        } catch (error) {
          console.error(`Failed to connect to ${chain.name}:`, error);
        }
      }
    }
  }

  private async connectToChain(chain: ChainConfig) {
    try {
      const provider = new ethers.WebSocketProvider(chain.rpcUrl);
      this.providers.set(chain.name, provider);
      
      // Test connection
      await provider.getNetwork();
      useGasStore.getState().setChainConnection(chain.name, true);
      
      // Listen for new blocks
      provider.on('block', async (blockNumber) => {
        try {
          const block = await provider.getBlock(blockNumber, false);
          if (block && block.baseFeePerGas) {
            const baseFeeGwei = parseFloat(ethers.formatUnits(block.baseFeePerGas, 'gwei'));
            const priorityFeeGwei = 2; // Simplified: use 2 Gwei as default priority fee
            
            // Update store
            useGasStore.getState().updateChainGas(chain.name, baseFeeGwei, priorityFeeGwei);
            
            // Update candlestick data
            this.updateCandlestick(chain.name, baseFeeGwei);
          }
        } catch (error) {
          console.error(`Error processing block for ${chain.name}:`, error);
        }
      });

      // Initialize candlestick tracking
      this.initializeCandlestick(chain.name);
      
      console.log(`Connected to ${chain.name}`);
    } catch (error) {
      console.error(`Failed to connect to ${chain.name}:`, error);
      useGasStore.getState().setChainConnection(chain.name, false);
    }
  }

  private initializeCandlestick(chainName: ChainName) {
    const now = Date.now();
    const intervalStart = Math.floor(now / (15 * 60 * 1000)) * (15 * 60 * 1000);
    
    this.currentCandles.set(chainName, {
      open: 0,
      high: 0,
      low: Infinity,
      close: 0,
      startTime: intervalStart,
    });

    // Set up 15-minute interval
    const interval = setInterval(() => {
      this.finalizeCandlestick(chainName);
    }, 15 * 60 * 1000);
    
    this.candlestickIntervals.set(chainName, interval);
  }

  private updateCandlestick(chainName: ChainName, gasPrice: number) {
    const candle = this.currentCandles.get(chainName);
    if (!candle) return;

    if (candle.open === 0) {
      candle.open = gasPrice;
    }
    
    candle.high = Math.max(candle.high, gasPrice);
    candle.low = Math.min(candle.low, gasPrice);
    candle.close = gasPrice;
    
    this.currentCandles.set(chainName, candle);
  }

  private finalizeCandlestick(chainName: ChainName) {
    const candle = this.currentCandles.get(chainName);
    if (!candle || candle.open === 0) return;

    const gasPoint: GasPoint = {
      time: candle.startTime,
      open: candle.open,
      high: candle.high,
      low: candle.low === Infinity ? candle.open : candle.low,
      close: candle.close,
    };

    useGasStore.getState().updateChainHistory(chainName, gasPoint);

    // Reset for next interval
    const now = Date.now();
    const intervalStart = Math.floor(now / (15 * 60 * 1000)) * (15 * 60 * 1000);
    
    this.currentCandles.set(chainName, {
      open: 0,
      high: 0,
      low: Infinity,
      close: 0,
      startTime: intervalStart,
    });
  }

  disconnect() {
    for (const [chainName, provider] of this.providers) {
      provider.removeAllListeners();
      provider.destroy();
      useGasStore.getState().setChainConnection(chainName, false);
    }
    
    for (const [chainName, interval] of this.candlestickIntervals) {
      clearInterval(interval);
    }
    
    this.providers.clear();
    this.candlestickIntervals.clear();
    this.currentCandles.clear();
  }
}

export const gasService = new GasService();