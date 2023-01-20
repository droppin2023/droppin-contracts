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
const { ethers, getNamedAccounts } = require("hardhat");
const { formatBytes32String } = require("ethers/lib/utils");

const deployCore = async () => {
  const { deployerAddr } = await getNamedAccounts();
  const sDeployer = await ethers.getSigner(deployerAddr);

  const cCoreFacetProxy = await ethers.getContractAt(
    "CoreFacet",
    (
      await ethers.getContract("DroppinDiamond")
    ).address
  );
  let tx = await cCoreFacetProxy
    .connect(sDeployer)
    .createGroup(formatBytes32String("Lepak DAO"));
  let receipt = await tx.wait();
  //   console.log(receipt);
  let groupCreatedEvent;
  console.log("Create Group Tx : ", receipt.transactionHash);
  for (const event of receipt.logs) {
    try {
      const parsedLog = cCoreFacetProxy.interface.parseLog(event);
      //   console.log(parsedLog);
      if (parsedLog && parsedLog.name === "GroupCreated") {
        groupCreatedEvent = parsedLog;
        break;
      }
    } catch (e) {}
  }

  // add quests
  const questsToAdd = [
    {
      name: formatBytes32String("Quest1"),
      groupId: 1,
      engagePoints: 750,
      owner: sDeployer,
    },
    {
      name: formatBytes32String("Quest2"),
      groupId: 1,
      engagePoints: 2000,
      owner: sDeployer,
    },
    {
      name: formatBytes32String("Quest3"),
      groupId: 1,
      engagePoints: 500,
      owner: sDeployer,
    },
    {
      name: formatBytes32String("Quest4"),
      groupId: 1,
      engagePoints: 100,
      owner: sDeployer,
    },
    {
      name: formatBytes32String("Quest5"),
      groupId: 1,
      engagePoints: 150,
      owner: sDeployer,
    },
  ];

  questsToAdd.forEach(async (item, id) => {
    const tx = await cCoreFacetProxy.connect(item.owner).addQuest(item);
    const receipt = await tx.wait();
    console.log("Create Quest %d : ", id + 1, receipt.transactionHash);
  });
};

const setUpContracts = async () => {};
const main = async () => {
  await deployCore();
  await setUpContracts();
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
