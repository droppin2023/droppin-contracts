require("hardhat");
// const { utils } = require("ethers");
// const { deployments, ethers, getNamedAccounts } = require("hardhat");
// const { parseUnits, formatUnits } = require("ethers").utils;
const {
  validatorAddresss,
  circuitId,
  isLocalHost,
} = require("../utils/helpers");
const {
  deployWithConfirmation,
  // withConfirmation,
  // log,
} = require("../utils/deploy");
const { getNamedAccounts, ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

// const deployCore = async () => {
//   await deployWithConfirmation("Droppin", [validatorAddresss, circuitId]);
// };

// const setUpContracts = async () => {};
const main = async () => {
  const { deployerAddr } = await getNamedAccounts();
  const sDeployer = await ethers.getSigner(deployerAddr);
  const accountsToFund = process.env.ACCOUNTS_TO_FUND.split(",");
  for (let i = 0; i < accountsToFund.length; i++) {
    let tx = await sDeployer.sendTransaction({
      to: accountsToFund[i],
      value: parseEther("100"),
    });
    await tx.wait();
  }
};

main.id = "001_core";
main.skip = () => true;
module.exports = main;
