import { create } from 'zustand';

export interface GasPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChainState {
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
  lastUpdated: number;
  isConnected: boolean;
}

export interface AppState {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainState;
    polygon: ChainState;
    arbitrum: ChainState;
  };
  usdPrice: number;
  transactionValue: number;
  gasLimit: number;
  setMode: (mode: 'live' | 'simulation') => void;
  setUsdPrice: (price: number) => void;
  setTransactionValue: (value: number) => void;
  setGasLimit: (limit: number) => void;
  updateChainGas: (chain: keyof AppState['chains'], baseFee: number, priorityFee: number) => void;
  updateChainHistory: (chain: keyof AppState['chains'], point: GasPoint) => void;
  setChainConnection: (chain: keyof AppState['chains'], connected: boolean) => void;
}

const initialChainState: ChainState = {
  baseFee: 0,
  priorityFee: 0,
  history: [],
  lastUpdated: 0,
  isConnected: false,
};

export const useGasStore = create<AppState>((set, get) => ({
  mode: 'live',
  chains: {
    ethereum: { ...initialChainState },
    polygon: { ...initialChainState },
    arbitrum: { ...initialChainState },
  },
  usdPrice: 0,
  transactionValue: 0.1, // Default 0.1 ETH
  gasLimit: 21000, // Default gas limit for simple transfer
  
  setMode: (mode) => set({ mode }),
  setUsdPrice: (price) => set({ usdPrice: price }),
  setTransactionValue: (value) => set({ transactionValue: value }),
  setGasLimit: (limit) => set({ gasLimit: limit }),
  
  updateChainGas: (chain, baseFee, priorityFee) => 
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          baseFee,
          priorityFee,
          lastUpdated: Date.now(),
        }
      }
    })),
  
  updateChainHistory: (chain, point) =>
    set((state) => {
      const currentHistory = state.chains[chain].history;
      const newHistory = [...currentHistory, point].slice(-96); // Keep last 24 hours (96 * 15min)
      
      return {
        chains: {
          ...state.chains,
          [chain]: {
            ...state.chains[chain],
            history: newHistory,
          }
        }
      };
    }),
  
  setChainConnection: (chain, connected) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          isConnected: connected,
        }
      }
    })),
}));