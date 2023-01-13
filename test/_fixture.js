const { ethers } = require("hardhat");
const hre = require("hardhat");

async function defaultFixture() {
    await deployments.fixture();
    const cDroppin = await ethers.getContract("Droppin");
    const signers = await ethers.getSigners();
    const bob = signers[0];
    const pia = signers[1];
    const tay = signers[2];
    return {
        cDroppin,
        bob,
        pia,
        tay
    }
}

module.exports = {
    defaultFixture
}