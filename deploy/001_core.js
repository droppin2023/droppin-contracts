require("hardhat");
// const { utils } = require("ethers");
// const { deployments, ethers, getNamedAccounts } = require("hardhat");
// const { parseUnits, formatUnits } = require("ethers").utils;
const { validatorAddresss, circuitId } = require("../utils/helpers");
const {
  deployWithConfirmation,
  // withConfirmation,
  // log,
} = require("../utils/deploy");

const deployCore = async () => {
  await deployWithConfirmation("Droppin", [validatorAddresss, circuitId]);
};

const setUpContracts = async () => {};
const main = async () => {
  await deployCore();
  await setUpContracts();
};

main.id = "001_core";
main.skip = () => true;
module.exports = main;
