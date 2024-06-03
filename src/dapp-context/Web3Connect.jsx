import { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { taskContractABI, taskContractAddressSepolia, workerContractABI, workerContractAddressSepolia } from '../utils/constants'

// Create the context
const WalletContext = createContext();

const EVENTS = {
  TASK: {
    TaskScheduled: 'TaskScheduled',
    TaskStatusUpdated: 'TaskStatusUpdated',
  },
  WORKER: {
    WorkerRegistered: 'WorkerRegistered'
  }
}
// Create a provider component
// eslint-disable-next-line react/prop-types
const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [taskTxContract, setTaskTxContract] = useState(null);
  const [workerTxContract, setWorkerTxContract] = useState(null);

  // Function to connect to the wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        console.log("provider: ", provider)
        console.log("signer: ", signer)
        console.log("account: ", account)
      } else {
        alert("Please install MetaMask: https://metamask.io/");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Automatically connect to wallet if already connected
  useEffect(() => {
    if (window.ethereum && provider == null) {
      console.log("etherum found!")
      connectWallet();
    } else {
      console.log("no ethereum found!")
    }

    if (signer && taskTxContract == null) {
      const transactionContract = new ethers.Contract(taskContractAddressSepolia, taskContractABI, signer)
      setTaskTxContract(transactionContract)
      console.log("transactionContract Task: ", transactionContract)
    }

    if (signer && workerTxContract == null) {
      const transactionContract = new ethers.Contract(workerContractAddressSepolia, workerContractABI, signer)
      setWorkerTxContract(transactionContract)
      console.log("transactionContract Worker: ", transactionContract)
    }
  }, [provider, signer, taskTxContract, workerTxContract]);

  return (
    <WalletContext.Provider value={{ provider, signer, account, connectWallet, taskTxContract, workerTxContract }}>
      {children}
    </WalletContext.Provider>
  );
};

// Export the context and provider
export { WalletContext, WalletProvider, EVENTS };