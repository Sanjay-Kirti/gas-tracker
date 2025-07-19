'use client';

import React, { useEffect } from 'react';
import { useGasStore } from '../store/gasStore';
import { gasService } from '../services/gasService';
import { usdPriceService } from '../services/usdPriceService';
import { GasPriceCard } from '../components/GasPriceCard';
import { GasChart } from '../components/GasChart';
import { SimulationPanel } from '../components/SimulationPanel';

export default function Dashboard() {
  const { 
    mode, 
    chains, 
    usdPrice, 
    transactionValue, 
    gasLimit, 
    setMode 
  } = useGasStore();

  useEffect(() => {
    // Initialize services
    gasService.initialize();
    usdPriceService.initialize();

    // Cleanup on unmount
    return () => {
      gasService.disconnect();
      usdPriceService.disconnect();
    };
  }, []);

  const toggleMode = () => {
    setMode(mode === 'live' ? 'simulation' : 'live');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ⛽ Gas Tracker
              </h1>
              <div className="ml-4 text-sm text-gray-600">
                Real-time cross-chain gas prices
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                ETH/USD: <span className="font-semibold">${usdPrice.toFixed(2)}</span>
              </div>
              
              <button
                onClick={toggleMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'live' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {mode === 'live' ? '📡 Live Mode' : '🧮 Simulation Mode'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Banner */}
        <div className={`mb-8 p-4 rounded-lg ${
          mode === 'live' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-purple-50 border border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${
                mode === 'live' ? 'text-blue-900' : 'text-purple-900'
              }`}>
                {mode === 'live' ? 'Live Gas Tracking' : 'Transaction Simulation'}
              </h2>
              <p className={`text-sm ${
                mode === 'live' ? 'text-blue-700' : 'text-purple-700'
              }`}>
                {mode === 'live' 
                  ? 'Real-time gas prices across Ethereum, Polygon, and Arbitrum' 
                  : 'Compare transaction costs across different chains'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-xs ${
                mode === 'live' ? 'text-blue-600' : 'text-purple-600'
              }`}>
                Mode
              </div>
              <div className={`text-lg font-semibold ${
                mode === 'live' ? 'text-blue-900' : 'text-purple-900'
              }`}>
                {mode === 'live' ? 'Live' : 'Simulation'}
              </div>
            </div>
          </div>
        </div>

        {/* Gas Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(chains).map(([chainName, chainState]) => (
            <GasPriceCard
              key={chainName}
              chainName={chainName}
              chainState={chainState}
              usdPrice={usdPrice}
              gasLimit={gasLimit}
              transactionValue={transactionValue}
              mode={mode}
            />
          ))}
        </div>

        {/* Chart and Simulation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gas Chart */}
          <div>
            <GasChart 
              data={chains.ethereum.history} 
              title="Ethereum Gas Price History (15min intervals)"
            />
          </div>

          {/* Simulation Panel - Only show in simulation mode */}
          {mode === 'simulation' && (
            <div>
              <SimulationPanel />
            </div>
          )}

          {/* Live Stats - Only show in live mode */}
          {mode === 'live' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Live Network Stats
              </h3>
              
              <div className="space-y-4">
                {Object.entries(chains).map(([chainName, chainState]) => (
                  <div key={chainName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        chainState.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium capitalize">{chainName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {(chainState.baseFee + chainState.priorityFee).toFixed(2)} Gwei
                      </div>
                      <div className="text-xs text-gray-500">
                        {chainState.lastUpdated 
                          ? `Updated ${Math.floor((Date.now() - chainState.lastUpdated) / 1000)}s ago`
                          : 'Never updated'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Quick Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Gas prices update automatically with new blocks</li>
                  <li>• Switch to Simulation mode to compare costs</li>
                  <li>• Chart shows 15-minute candlesticks for Ethereum</li>
                  <li>• Green connection dots indicate active data feeds</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Data updates every ~6 seconds • ETH/USD price from Uniswap V3 • 
            {Object.values(chains).filter(c => c.isConnected).length} of 3 chains connected
          </p>
        </div>
      </main>
    </div>
  );
}