const { ethers } = require("hardhat");
const hre = require("hardhat");

async function defaultFixture() {
  await hre.deployments.fixture();
  const cDroppin = await ethers.getContract("DroppinDiamond");
  const cCoreFacet = await ethers.getContractAt("CoreFacet", cDroppin.address);
  const cBadgeFacet = await ethers.getContractAt(
    "BadgeFacet",
    cDroppin.address
  );
  const signers = await ethers.getSigners();
  const bob = signers[0];
  const pia = signers[1];
  const tay = signers[2];
  return {
    cDroppin,
    bob,
    pia,
    tay,
    cCoreFacet,
    cBadgeFacet,
  };
}

module.exports = {
  defaultFixture,
};
