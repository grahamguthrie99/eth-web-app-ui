import React, { useEffect, useState } from "react";
import abi from './utils/PumpPortal.json';
import { ethers } from "ethers";
import './App.css';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allPumps, setAllPumps] = useState([]);
  const contractAddress = "0x3187Dc41cda658FfE54C401b4D144B486a20D2c0";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const pump = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const pumpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await pumpPortalContract.getTotalPumps();
        console.log("Retrieved total pump count...", count.toNumber());
        const txn = await pumpPortalContract.pump("this is a message");
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);

        count = await pumpPortalContract.getTotalPumps();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllPumps();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

const getAllPumps = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const pumpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);


      const pumps = await pumpPortalContract.getAllPumps();
      

      let pumpsCleaned = [];
      pumps.forEach(pump => {
        pumpsCleaned.push({
          address: pump.pumper,
          timestamp: new Date(pump.timestamp * 1000),
          message: pump.message
        });
      });

  
      setAllPumps(pumpsCleaned);
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error);
  }
}

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
    <div className="dataContainer">
      <div className="header">
        👋 Hey there!
      </div>

      <div className="bio">
        I am Graham... Connect your Ethereum wallet and wave at me!
      </div>

      <button className="waveButton" onClick={pump}>
        Shoot me a pump
      </button>

      {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {allPumps.map((pump, index) => {
        return (
          <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
            <div>Address: {pump.address}</div>
            <div>Time: {pump.timestamp.toString()}</div>
            <div>Message: {pump.message}</div>
          </div>)
      })}
    </div>
  </div>
  );
}

export default App