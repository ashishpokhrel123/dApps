const { ethers } = require("hardhat");

async function main() {
  // Get the ContractFactory
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  
  // Deploy the contract
  const buyMeACoffee = await BuyMeACoffee.deploy();
  
  // Wait for deployment confirmation
  await buyMeACoffee.waitForDeployment();
  
  console.log("Contract deployed to:", await buyMeACoffee.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });