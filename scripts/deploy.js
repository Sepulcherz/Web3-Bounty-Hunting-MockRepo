// deploy.js - Script to deploy the TaskBounty contract to Sepolia network
const hre = require("hardhat");

async function main() {
   try {
       console.log("Starting deployment...");

       // Get the contract factory
       const TaskBounty = await hre.ethers.getContractFactory("TaskBounty");

       // Define deployment parameters
       const description = "Test Bounty: Fix UI Bug";
       const deadline = 7 * 24 * 60 * 60; // 1 week in seconds
       const minApprovals = 2; // Number of validators needed
       const reward = hre.ethers.parseEther("0.01"); // 0.01 ETH as reward

       console.log("Deploying contract with parameters:", {
           description,
           deadline,
           minApprovals,
           reward: reward.toString()
       });

       // Deploy the contract
       const taskBounty = await TaskBounty.deploy(
           description,
           deadline,
           minApprovals,
           { value: reward }
       );

       // Wait for deployment to finish
       await taskBounty.waitForDeployment();

       // Get the deployed contract address
       const contractAddress = await taskBounty.getAddress();
       console.log("TaskBounty deployed to:", contractAddress);

       // Log deployment details for verification
       console.log("Deployment details:");
       console.log("- Description:", description);
       console.log("- Deadline:", deadline, "seconds");
       console.log("- Min Approvals:", minApprovals);
       console.log("- Reward:", reward.toString(), "ETH");

   } catch (error) {
       console.error("Deployment failed:", error);
       throw error;
   }
}

// Execute deployment
main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});