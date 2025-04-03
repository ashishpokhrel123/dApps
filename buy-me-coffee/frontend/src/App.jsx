import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractABI from "./utils/BuyMeACoffee.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [buying, setBuying] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [memos, setMemos] = useState([]);
  const [amount, setAmount] = useState("0.001");

  const getProvider = () => new ethers.BrowserProvider(window.ethereum);

  const isWalletConnected = useCallback(async () => {
    try {
      const provider = getProvider();
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        toast.success(`Wallet connected: ${accounts[0]}`);
      } else {
        toast.info("No wallet connected. Please connect MetaMask.");
      }
    } catch (error) {
      toast.error("Error checking wallet connection.");
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error("Failed to connect wallet.");
    }
  }, []);

  const buyCoffee = useCallback(async () => {
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      setBuying(true);
      toast.info("Processing transaction...");
      const tx = await contract.buyCoffee(name || "anon", message || "Enjoy your coffee!", {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      toast.success("Coffee purchased successfully!");
      setName("");
      setMessage("");
      
      getMemos(); // Refresh memos after buying coffee
    } catch (error) {
      toast.error("Transaction failed.");
    } finally {
      setBuying(false);
    }
  }, [name, message, amount]);

 const getMemos = useCallback(async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider); // Use provider, NOT signer
    
    const fetchedMemos = await contract.getMemos(); // Correct way to call it
    console.log("Memos fetched:", fetchedMemos);

    setMemos(fetchedMemos);
  } catch (error) {
    console.error("Error fetching memos:", error);
    toast.error("Could not fetch memos.");
  }
}, []);


  useEffect(() => {
    isWalletConnected();
    getMemos();

    // Polling instead of .on() for new memos
    const interval = setInterval(() => {
      getMemos();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isWalletConnected, getMemos]);

  return (
<div className="container">
  <h1>Buy Albert a Coffee!</h1>

  {currentAccount ? (
    <div className="form-container">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />
      <textarea
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea-field"
      />
      <button onClick={buyCoffee} disabled={buying} className={`btn ${buying ? "disabled" : ""}`}>
        {buying ? "Buying..." : `Send 1 Coffee for ${amount} ETH`}
      </button>
    </div>
  ) : (
    <button onClick={connectWallet} className="btn connect-wallet">
      Connect Wallet
    </button>
  )}

  <h2>Memos Received</h2>
  <div className="memos-container">
    {memos.map((memo, idx) => (
      <div key={idx} className="memo">
        <p className="memo-message">"{memo.message}"</p>
        <p className="memo-meta">— {memo.name} ({memo.address})</p>
        <p className="memo-time">{memo.timestamp.toString()}</p>
      </div>
    ))}
  </div>
</div>

  );
}

export default App;
