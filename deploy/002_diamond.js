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

  // scripts for testing on backend

//   let tx2 = await cCoreFacetProxy
//     .connect(sDeployer)
//     .modifyGroup(
//       1,
//       formatBytes32String("Lepak DAO"),
//       "0xB7a0D386fA245C1E72Ca26127bA25e75816769f2"
//     );
//     await tx2.wait();
  //   const badgeData = {
  //     requiredQuests: [1, 4, 0],
  //     engagePointsThreshold: 1000,
  //     badgePrice: parseEther("0.01"),
  //     name: "Hacker Badge",
  //     NFT: ethers.constants.AddressZero,
  //     groupId: 1,
  //     owner: sDeployer,
  //     symbol: "HACK",
  //     URI: "www.google.com",
  //   };

  //   const cBadgeFacetProxy = await ethers.getContractAt(
  //     "BadgeFacet",
  //     dDroppin.address
  //   );
  //   tx = await cBadgeFacetProxy
  //     .connect(badgeData.owner)
  //     .addBadge(badgeData, badgeData.symbol, badgeData.URI);
  //   receipt = await tx.wait();
  //   console.log("Create badge Tx : ", receipt.transactionHash);
};

const main = async () => {
  await deployAll();
};

main.id = "001_core";
main.skip = () => true;
module.exports = main;
