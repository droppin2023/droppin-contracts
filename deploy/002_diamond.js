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

const deployAll = async () => {
  const { deployerAddr } = await getNamedAccounts();
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
};

const main = async () => {
  await deployAll();
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
