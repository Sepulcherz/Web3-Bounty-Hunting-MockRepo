const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskBounty", function () {
  it("Should create a task with correct reward", async function () {
    const TaskBounty = await ethers.getContractFactory("TaskBounty");
    const reward = ethers.parseEther("0.1"); // 0.1 ETH
    const taskBounty = await TaskBounty.deploy("Fix the bug", { value: reward });

    expect(await taskBounty.reward()).to.equal(reward);
    expect(await taskBounty.taskDescription()).to.equal("Fix the bug");
  });
});
