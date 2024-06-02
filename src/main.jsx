import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { WalletProvider } from './dapp-context/Web3Connect';
import './index.css'
import { CyborgContextProvider } from './dapp-context/CyborgContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <CyborgContextProvider>
        <App />
      </CyborgContextProvider>
    </WalletProvider>
  </React.StrictMode>,
)
