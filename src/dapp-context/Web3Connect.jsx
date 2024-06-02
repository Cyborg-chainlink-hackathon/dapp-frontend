import { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Create the context
const WalletContext = createContext();

// Create a provider component
// eslint-disable-next-line react/prop-types
const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // Function to connect to the wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(account);
      } else {
        console.log("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Automatically connect to wallet if already connected
  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }
  }, []);

  return (
    <WalletContext.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Export the context and provider
export { WalletContext, WalletProvider };
