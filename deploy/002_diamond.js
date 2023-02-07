require("hardhat");
// const { utils } = require("ethers");
const { ethers, getNamedAccounts } = require("hardhat");
// const { parseUnits, formatUnits } = require("ethers").utils;
const { FacetCutAction, getSelectors } = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  // log,
} = require("../utils/deploy");
const {
  formatBytes32String,
  parseEther,
  hexValue,
} = require("ethers/lib/utils");
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

  await deployWithConfirmation("BadgeFacet", [
    "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB",
  ]);
  const cBadgeFacet = await ethers.getContract("BadgeFacet");
  selectors = getSelectors(cBadgeFacet); // selectors of this facet
  await withConfirmation(
    cDiamondCutFacet.diamondCut(
      [
        {
          facetAddress: cBadgeFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors.remove([
            "transferOwnership(address)",
            "owner()",
          ]),
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    )
  );

  const cBadgeFacetProxy = await ethers.getContractAt(
    "BadgeFacet",
    dDroppin.address
  );

  let tx = await cBadgeFacetProxy.setValidator(
    "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB"
  );
  await tx.wait();
  // scripts for testing on backend
  // const cCoreFacetProxy = await ethers.getContractAt(
  //   "CoreFacet",
  //   dDroppin.address
  // );
  // let tx = await cCoreFacetProxy
  //   .connect(sDeployer)
  //   .createGroup(formatBytes32String("Lepak DAO"));
  // let receipt = await tx.wait();
  // //   console.log(receipt);
  // let groupCreatedEvent;
  // console.log("Create Group Tx : ", receipt.transactionHash);
  // for (const event of receipt.logs) {
  //   try {
  //     const parsedLog = cCoreFacetProxy.interface.parseLog(event);
  //     //   console.log(parsedLog);
  //     if (parsedLog && parsedLog.name === "GroupCreated") {
  //       groupCreatedEvent = parsedLog;
  //       break;
  //     }
  //   } catch (e) {}
  // }

  // // add quests
  // const questsToAdd = [
  //   {
  //     name: formatBytes32String("Quest1"),
  //     groupId: 1,
  //     engagePoints: 750,
  //     owner: sDeployer,
  //   },
  //   {
  //     name: formatBytes32String("Quest2"),
  //     groupId: 1,
  //     engagePoints: 2000,
  //     owner: sDeployer,
  //   },
  //   {
  //     name: formatBytes32String("Quest3"),
  //     groupId: 1,
  //     engagePoints: 500,
  //     owner: sDeployer,
  //   },
  //   {
  //     name: formatBytes32String("Quest4"),
  //     groupId: 1,
  //     engagePoints: 100,
  //     owner: sDeployer,
  //   },
  //   {
  //     name: formatBytes32String("Quest5"),
  //     groupId: 1,
  //     engagePoints: 150,
  //     owner: sDeployer,
  //   },
  // ];

  // questsToAdd.forEach(async (item,id) => {
  //   const tx = await cCoreFacetProxy.connect(item.owner).addQuest(item);
  //   const receipt = await tx.wait();
  //   console.log("Create Quest %d : ", id+1, receipt.transactionHash);
  // });

  // const badgeData = {
  //   requiredQuests: [1, 4, 0],
  //   engagePointsThreshold: 1000,
  //   badgePrice: parseEther("0.01"),
  //   name: "Hacker Badge",
  //   NFT: ethers.constants.AddressZero,
  //   groupId: 1,
  //   owner: sDeployer,
  //   symbol: "HACK",
  //   URI: "www.google.com",
  // };

  // const cBadgeFacetProxy = await ethers.getContractAt(
  //   "BadgeFacet",
  //   dDroppin.address
  // );
  // tx = await cBadgeFacetProxy
  //   .connect(badgeData.owner)
  //   .addBadge(badgeData, badgeData.symbol, badgeData.URI);
  // receipt = await tx.wait();
  // console.log("Create badge Tx : ", receipt.transactionHash);
};

const main = async () => {
  await deployAll();
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
