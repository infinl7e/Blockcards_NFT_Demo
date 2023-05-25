import { POSClient, use } from "@maticnetwork/maticjs";
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers';

use(Web3ClientPlugin);


const contractAddress = "0xE72B0B69F66F6f29aBD008917E3dbC004B14f5F0";
const contractABI = require('./contractABI.json');

let contract;
let maticProvider;

async function connectContract() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    // Update the wallet address display
    const walletAddressDiv = document.getElementById("wallet-address");
    walletAddressDiv.textContent = account ? account : 'Not connected';

    maticProvider = new POSClient({
      network: 'testnet', // or 'mainnet' for the mainnet network
      version: 'mumbai', // or 'v1' for the mainnet network
      parentProvider: new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com'), // Use the correct RPC URL for the Matic network
      maticProvider: new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com'), // Use the correct RPC URL for the Matic network
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(account);
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    return contract;
  } catch (error) {
    console.error("An error occurred while trying to connect to the wallet: ", error);
  }
}

const mintButton = document.getElementById("mint-button");
mintButton.addEventListener("click", async () => {
  const numNFTs = parseInt(prompt("Enter the number of NFTs to mint:"));
  if (!isNaN(numNFTs)) {
    await mintNFTs(numNFTs);
  }
});

async function mintNFTs(numNFTs) {
  const options = {
    gasLimit: 3000000,
  };

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  const account = accounts[0];

  const transaction = await contract._mintNFT(account, numNFTs, options);
  await transaction.wait();

  // Refresh the NFTs grid
  displayNFTs();
}

async function displayNFTs() {
  const nftContainer = document.getElementById("nft-container");
  nftContainer.innerHTML = "";

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  const account = accounts[0];

  const balance = await contract.balanceOf(account);
  const tokenIds = [];
  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(account, i);
    tokenIds.push(tokenId);
  }

  for (const tokenId of tokenIds) {
  const rarity = await contract.ChkTokenRarity(tokenId);
  const shiny = await contract.ChkTokenShiny(tokenId);

  const nftCard = document.createElement("div");
  nftCard.classList.add("nft-card");

  const nftFront = document.createElement("div");
  nftFront.classList.add("nft-front");

  const nftBack = document.createElement("div");
  nftBack.classList.add("nft-back", `rarity-${rarity}`);
  if (shiny == 1 & rarity == 1) {
    nftBack.classList.add("special-shiny-1");
  } else if (shiny == 1 & rarity == 2) {
    nftBack.classList.add("special-shiny-2");
  } else if (shiny == 1 & rarity == 3) {
    nftBack.classList.add("special-shiny-3");
  } else if (shiny == 1 & rarity == 4) {
    nftBack.classList.add("special-shiny-4");
  } else if (shiny == 1 & rarity == 5) {
    nftBack.classList.add("special-shiny-5");
  } else if (shiny == 1 & rarity == 6) {
    nftBack.classList.add("special-shiny-6");
}
	
  nftBack.textContent = `Rarity: ${rarity}\nShiny: ${shiny}`;

  nftCard.appendChild(nftFront);
  nftCard.appendChild(nftBack);
  nftContainer.appendChild(nftCard);

  nftCard.addEventListener("click", () => {
    if (nftCard.classList.contains("flipped")) {
      nftCard.classList.remove("flipped");
    } else {
      nftCard.classList.add("flipped");
    }
  });

  nftContainer.appendChild(nftCard);
}
}

async function connectAndDisplay() {
  await ethereum.request({ method: "eth_requestAccounts" });
  await connectContract();
  displayNFTs();
}

window.onload = connectAndDisplay;
