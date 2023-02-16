import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/const';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  //   console.log({ provider, signer, transactionContract });

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currAccount, setCurrAccount] = useState('');

  const [formData, setFormData] = useState({
    addressTo: '',
    amount: 0,
    keyword: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount')
  );

  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const transactionContract = getEthereumContract();

      const availableTransactions =
        await transactionContract.getAllTransactions();

      // console.log('availableTransactions', availableTransactions);

      const structuredTransactions = availableTransactions.map(
        (transaction, i) => {
          return {
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18,
          };
        }
      );

      // console.log('structuredTransactions', structuredTransactions);

      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object.');
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      console.log('accounts', accounts);

      if (accounts.length) {
        setCurrAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log('No accounts found.');
      }
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object.');
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const transactionContract = getEthereumContract();
      const count = await transactionContract.getTransactionCount();

      // console.log('count', count)

      window.localStorage.setItem('transactionCount', count);
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object.');
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object.');
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currAccount,
            to: addressTo,
            gas: '0x5208', // 21000 GWEI
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);

      await transactionHash.wait();

      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const count = await transactionContract.getTransactionCount();

      setTransactionCount(count.toNumber());

      window.reload();
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object.');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currAccount,
        handleChange,
        formData,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
