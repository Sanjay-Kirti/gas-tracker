# Gas Tracker

A real-time, cross-chain gas price dashboard and wallet simulation tool for Ethereum, Polygon, and Arbitrum. Built with Next.js, Tailwind CSS, Zustand, Ethers.js, and Lightweight Charts.

---

## Features

- **Live Gas Tracking:**  
  Real-time gas prices for Ethereum, Polygon, and Arbitrum using WebSocket connections to native RPC endpoints.
- **USD Pricing:**  
  Live ETH/USD price from Uniswap V3 on Ethereum Mainnet.
- **Candlestick Chart:**  
  15-minute interval candlestick chart for Ethereum base fee volatility.
- **Wallet Simulation:**  
  Simulate transaction costs in USD for all three chains, with customizable transaction value and gas limit.
- **Responsive UI:**  
  Built with Next.js and Tailwind CSS for a modern, mobile-friendly experience.

---

## Getting Started

### 1. **Clone the Repository**
```sh
git clone https://github.com/Sanjay-Kirti/gas-tracker.git
cd gas-tracker
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Configure Environment Variables**

Create a `.env.local` file in the project root with your WebSocket RPC endpoints:
```
NEXT_PUBLIC_ETHEREUM_RPC_WS=wss://YOUR_ETHEREUM_RPC_WS
NEXT_PUBLIC_POLYGON_RPC_WS=wss://YOUR_POLYGON_RPC_WS
NEXT_PUBLIC_ARBITRUM_RPC_WS=wss://YOUR_ARBITRUM_RPC_WS
```
> **Tip:** You can get free endpoints from [Alchemy](https://www.alchemy.com/), [Infura](https://infura.io/), or other providers.

### 4. **Run the Development Server**
```sh
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
gas-tracker/
├── src/
│   ├── app/                # Next.js app directory (pages, layout, global styles)
│   ├── components/         # React components (GasChart, GasPriceCard, SimulationPanel)
│   ├── services/           # Data fetching and aggregation logic (gasService, usdPriceService)
│   └── store/              # Zustand state management (gasStore)
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json
└── README.md
```

---

## Customization

- **Add More Chains:**  
  Extend the Zustand store and services to support additional EVM-compatible chains.
- **Improve Charting:**  
  Fetch and display historical gas data for richer charting.
- **UI Enhancements:**  
  Customize with your own branding, colors, or additional analytics.

---

## Troubleshooting

- **No Styles?**  
  Ensure `postcss.config.js` and `tailwind.config.js` are in the project root, and that `@tailwind` directives are present in `src/app/globals.css`.
- **No Chart Data?**  
  The chart will be empty until enough data is collected for a 15-minute interval, unless you implement historical data fetching.
- **Font Errors?**  
  If Google Fonts fail to load, the app will fall back to system fonts.

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ethers.js](https://docs.ethers.org/)
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

