// interact.js
const hre = require("hardhat");

async function main() {
    try {
        // Smart contract deployed on sepolia testnet
        const CONTRACT_ADDRESS = "0xDE4eADf86cdC4B4E952439c24FbeD634728C6428";

        console.log("Setting up contract interaction...");
        
        // Get the contract factory
        const TaskBounty = await hre.ethers.getContractFactory("TaskBounty");
        
        // Get the first signer from Hardhat
        const [signer] = await hre.ethers.getSigners();
        console.log("Using account:", signer.address);

        // Attach to the deployed contract with signer
        const contract = TaskBounty.connect(signer).attach(CONTRACT_ADDRESS);
        
        // Try to read some data
        console.log("Reading contract data...");
        const owner = await contract.owner();
        console.log("Contract owner:", owner);

    } catch (error) {
        if (error.code) {
            console.error("Error code:", error.code);
        }
        console.error("Error message:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });