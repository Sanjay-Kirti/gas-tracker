import React from 'react';
import { useGasStore } from '../store/gasStore';

export const SimulationPanel: React.FC = () => {
  const { 
    transactionValue, 
    gasLimit, 
    chains, 
    usdPrice, 
    setTransactionValue, 
    setGasLimit 
  } = useGasStore();

  const calculateCosts = () => {
    return Object.entries(chains).map(([chainName, chainState]) => {
      const { baseFee, priorityFee } = chainState;
      
      // Calculate gas cost in ETH
      const gasCostEth = (baseFee + priorityFee) * gasLimit * 1e-9; // Convert Gwei to ETH
      const gasCostUsd = gasCostEth * usdPrice;
      
      // Calculate transaction cost in USD
      const transactionCostUsd = transactionValue * usdPrice;
      
      // Total cost
      const totalCostUsd = gasCostUsd + transactionCostUsd;
      
      return {
        chainName,
        gasCostEth,
        gasCostUsd,
        transactionCostUsd,
        totalCostUsd,
        isConnected: chainState.isConnected,
      };
    });
  };

  const costs = calculateCosts();
  
  // Find cheapest and most expensive chains
  const connectedCosts = costs.filter(c => c.isConnected);
  const cheapestChain = connectedCosts.reduce((min, chain) => 
    chain.totalCostUsd < min.totalCostUsd ? chain : min, 
    connectedCosts[0]
  );
  
  const mostExpensiveChain = connectedCosts.reduce((max, chain) => 
    chain.totalCostUsd > max.totalCostUsd ? chain : max, 
    connectedCosts[0]
  );

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Transaction Simulation</h3>
        <div className="text-sm text-gray-600">
          ETH/USD: ${usdPrice.toFixed(2)}
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Value (ETH)
          </label>
          <input
            type="number"
            value={transactionValue}
            onChange={(e) => setTransactionValue(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gas Limit
          </label>
          <input
            type="number"
            value={gasLimit}
            onChange={(e) => setGasLimit(parseInt(e.target.value) || 21000)}
            step="1000"
            min="21000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="21000"
          />
        </div>
      </div>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTransactionValue(0.1)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
        >
          0.1 ETH
        </button>
        <button
          onClick={() => setTransactionValue(0.5)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
        >
          0.5 ETH
        </button>
        <button
          onClick={() => setTransactionValue(1.0)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
        >
          1.0 ETH
        </button>
        <button
          onClick={() => setGasLimit(21000)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
        >
          Simple Transfer
        </button>
        <button
          onClick={() => setGasLimit(60000)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
        >
          Token Transfer
        </button>
        <button
          onClick={() => setGasLimit(200000)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
        >
          Smart Contract
        </button>
      </div>

      {/* Cost Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gas Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {costs.map((cost) => (
              <tr 
                key={cost.chainName}
                className={`
                  ${cost.isConnected ? '' : 'opacity-50 bg-gray-50'}
                  ${cost.chainName === cheapestChain?.chainName ? 'bg-green-50' : ''}
                  ${cost.chainName === mostExpensiveChain?.chainName && connectedCosts.length > 1 ? 'bg-red-50' : ''}
                `}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getChainIcon(cost.chainName)}</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {cost.chainName}
                    </span>
                    {cost.chainName === cheapestChain?.chainName && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Cheapest
                      </span>
                    )}
                    {cost.chainName === mostExpensiveChain?.chainName && connectedCosts.length > 1 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Most Expensive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>${cost.gasCostUsd.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {cost.gasCostEth.toFixed(6)} ETH
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${cost.transactionCostUsd.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${cost.totalCostUsd.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cost.isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cost.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {connectedCosts.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Savings Summary</h4>
          <p className="text-sm text-blue-800">
            By using {cheapestChain?.chainName} instead of {mostExpensiveChain?.chainName}, 
            you could save{' '}
            <span className="font-semibold">
              ${(mostExpensiveChain?.totalCostUsd - cheapestChain?.totalCostUsd).toFixed(2)}
            </span>
            {' '}({(((mostExpensiveChain?.totalCostUsd - cheapestChain?.totalCostUsd) / mostExpensiveChain?.totalCostUsd) * 100).toFixed(1)}%)
          </p>
        </div>
      )}
    </div>
  );
};