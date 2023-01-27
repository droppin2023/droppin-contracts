require("hardhat");
// const { utils } = require("ethers");
const { ethers, getNamedAccounts } = require("hardhat");
// const { parseUnits, formatUnits } = require("ethers").utils;
const {
  FacetCutAction,
  getSelectors,
  isLocalHost,
} = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  // log,
} = require("../utils/deploy");
const { formatBytes32String, parseEther } = require("ethers/lib/utils");
// import
const deployAll = async () => {
  const { deployerAddr } = await getNamedAccounts();
  const sDeployer = await ethers.getSigner(deployerAddr);
  const dDiamondInit = await deployWithConfirmation(`DroppinDiamondInit`);
  const cDiamondInit = await ethers.getContract("DroppinDiamondInit");

  const FacetNames = ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"];
  // // The `facetCuts` variable is the FacetCut[] that contains the functions to add during diamond deployment
  const facetCuts = [];
  for (const FacetName of FacetNames) {
    const dFacet = await deployWithConfirmation(FacetName);
    const cFacet = await ethers.getContractAt(FacetName, dFacet.address);
    facetCuts.push({
      facetAddress: cFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(cFacet),
    });
  }
  const functionCall = cDiamondInit.interface.encodeFunctionData("init");
  const diamondArgs = {
    owner: deployerAddr,
    init: cDiamondInit.address,
    initCalldata: functionCall,
  };
  const dDroppin = await deployWithConfirmation(`DroppinDiamond`, [
    facetCuts,
    diamondArgs,
  ]);
  const cDiamondCutFacet = await ethers.getContractAt(
    "DiamondCutFacet",
    dDroppin.address
  );

  await deployWithConfirmation("CoreFacet");
  const cCoreFacet = await ethers.getContract("CoreFacet");
  let selectors = getSelectors(cCoreFacet); // selectors of this facet
  await withConfirmation(
    cDiamondCutFacet.diamondCut(
      [
        {
          facetAddress: cCoreFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    )
  );

  await deployWithConfirmation("BadgeFacet");
  const cBadgeFacet = await ethers.getContract("BadgeFacet");
  selectors = getSelectors(cBadgeFacet); // selectors of this facet
  await withConfirmation(
    cDiamondCutFacet.diamondCut(
      [
        {
          facetAddress: cBadgeFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    )
  );

  const cOwnershipProxy = await ethers.getContractAt(
    "OwnershipFacet",
    dDroppin.address
  );
  console.log("CONTRACT OWNER: ", await cOwnershipProxy.owner());

  // scripts for testing on backend
  const cCoreFacetProxy = await ethers.getContractAt(
    "CoreFacet",
    dDroppin.address
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
    },
    {
      name: formatBytes32String("Quest2"),
      groupId: 1,
      engagePoints: 2000,
    },
    {
      name: formatBytes32String("Quest3"),
      groupId: 1,
      engagePoints: 500,
    },
    {
      name: formatBytes32String("Quest4"),
      groupId: 1,
      engagePoints: 100,
    },
    {
      name: formatBytes32String("Quest5"),
      groupId: 1,
      engagePoints: 150,
    },
  ];
  for (let i = 1; i < questsToAdd.length; i++) {
    console.log("Adding Quest %d : ", i + 1);
    const tx = await cCoreFacetProxy.addQuest(questsToAdd[i - 1], {
      gasLimit: 500000,
    });
    const receipt = await tx.wait();
    console.log("Create Quest %d : ", i + 1, receipt.transactionHash);
  }
  const badgeData = {
    requiredQuests: [1, 4, 0],
    engagePointsThreshold: 500,
    badgePrice: parseEther("0.01"),
    name: "Hacker Badge",
    NFT: ethers.constants.AddressZero,
    groupId: 1,
    owner: sDeployer,
    symbol: "HACK",
    URI: "www.google.com",
  };

  const cBadgeFacetProxy = await ethers.getContractAt(
    "BadgeFacet",
    dDroppin.address
  );
  tx = await cBadgeFacetProxy
    .connect(badgeData.owner)
    .addBadge(badgeData, badgeData.symbol, badgeData.URI);
  receipt = await tx.wait();
  console.log("Create badge Tx : ", receipt.transactionHash);

  // user completes the quests required
  tx = await cCoreFacetProxy.completeQuest(1, sDeployer.address);
  await tx.wait();
  tx = await cCoreFacetProxy.completeQuest(4, sDeployer.address);
  await tx.wait();

  tx = await cBadgeFacetProxy.claimBadge(1, { value: parseEther("0.01") });
  receipt = await tx.wait();
  console.log("Claim badge tx: ", receipt.transactionHash);
};

const main = async () => {
  await deployAll();
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
