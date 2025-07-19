import React from 'react';
import { ChainState } from '../store/gasStore';

interface GasPriceCardProps {
  chainName: string;
  chainState: ChainState;
  usdPrice: number;
  gasLimit: number;
  transactionValue: number;
  mode: 'live' | 'simulation';
}

export const GasPriceCard: React.FC<GasPriceCardProps> = ({
  chainName,
  chainState,
  usdPrice,
  gasLimit,
  transactionValue,
  mode,
}) => {
  const { baseFee, priorityFee, isConnected, lastUpdated } = chainState;

  // Calculate total gas cost in ETH
  const totalGasFee = (baseFee + priorityFee) * gasLimit * 1e-9; // Convert Gwei to ETH
  
  // Calculate USD costs
  const gasCostUsd = totalGasFee * usdPrice;
  const transactionCostUsd = transactionValue * usdPrice;
  const totalCostUsd = gasCostUsd + transactionCostUsd;

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const getChainColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return 'from-blue-500 to-blue-600';
      case 'polygon':
        return 'from-purple-500 to-purple-600';
      case 'arbitrum':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return '⟠';
      case 'polygon':
        return '⬟';
      case 'arbitrum':
        return '◉';
      default:
        return '○';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getChainColor(chainName)} flex items-center justify-center text-white text-lg font-bold`}>
            {getChainIcon(chainName)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 capitalize">{chainName}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-xs text-gray-600">{formatTime(lastUpdated)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Base Fee</div>
          <div className="text-lg font-semibold text-gray-800">
            {baseFee.toFixed(2)} <span className="text-sm font-normal text-gray-500">Gwei</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Priority Fee</div>
          <div className="text-lg font-semibold text-gray-800">
            {priorityFee.toFixed(2)} <span className="text-sm font-normal text-gray-500">Gwei</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Gas Cost</span>
          <span className="text-sm font-medium text-gray-800">${gasCostUsd.toFixed(2)}</span>
        </div>
        
        {mode === 'simulation' && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Transaction Value</span>
            <span className="text-sm font-medium text-gray-800">${transactionCostUsd.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-base font-medium text-gray-800">
            {mode === 'simulation' ? 'Total Cost' : 'Est. Transaction Cost'}
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${mode === 'simulation' ? totalCostUsd.toFixed(2) : gasCostUsd.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Gas Limit: {gasLimit.toLocaleString()} • ETH/USD: ${usdPrice.toFixed(2)}
      </div>
    </div>
  );
};