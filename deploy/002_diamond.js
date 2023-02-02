require("hardhat");
// const { utils } = require("ethers");
const { ethers, getNamedAccounts } = require("hardhat");
// const { parseUnits, formatUnits } = require("ethers").utils;
const {
  FacetCutAction,
  getSelectors,
  isLocalHost,
  callToServer,
} = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  // log,
} = require("../utils/deploy");
const {
  formatBytes32String,
  parseEther,
  recoverPublicKey,
} = require("ethers/lib/utils");

const USER1_DETAIL = {
  username: "frankdegods",
  name: "Frank III",
  description: "social experimenter @degodsnft & @y00tsNFT",
  image:
    "https://pbs.twimg.com/profile_images/1613508920282353664/ndW25m7l_400x400.jpg",
  discord: {
    id: "dummy",
    username: "dummy",
    discriminator: "dummy",
  },
  twitter: "https://twitter.com/frankdegods",
};

const GROUP1 = {
  logo: "https://powered.by.dustlabs.com/cdn-cgi/image/width=384/https://8739e0e7.os-4cs.pages.dev/y00ts/y00ts-logo.svg",
  name: "y00ts",
  category: "NFT",
  description:
    "y00ts is a generative art project of 15,000 NFTs. it is our love letter to the Web3 community. designed to be aesthetic. engineered to be functional. curated to contain the best community of builders and creators on the internet. welcome to y00topia.",
  repUnit: "YT",
  link: "https://www.y00ts.com/",
  discord: "https://discord.gg/y00ts",
};

const QUEST1 = {
  condition: {
    type: "discord",
    conditionDetail: {
      guildId: 1002167946828853268,
      roleId: 1016003195111227472,
    },
  },
  groupId: 1,
  engagePoints: 10,
  detail:
    "Verify your @t00bs role in Discord. And prove you are y00ts NFT holder",
  name: "Verify @t00bs role",
};

const QUEST2 = {
  condition: {
    type: "form",
  },
  name: "write on Migration to Polygon",
  detail:
    "Y00ts move to Polygon. Learn about our migration and write down insights about this. Attach your content's link! ( twitter, mirror, medium etc ) ",
  groupId: 1,
  engagePoints: 20,
};

const BADGE1 = {
  requiredQuests: [1, 0, 0],
  engagePointsThreshold: 10,
  badgePrice: 0,
  name: "DeGods Holder",
  NFT: ethers.constants.AddressZero,
  groupId: 1, // Degods community
  symbol: "HOLDER",
  URI: "https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafkreicndlrqersl63a7fpk6zzw73lsklj5bwsidk74n4solbcyz2g3viq.ipfs.nftstorage.link/",
  description: "Welcome Holder! This is the badge for DeGods NFT holders.",
};

const BADGE2 = {
  requiredQuests: [1, 2, 0],
  engagePointsThreshold: 30,
  badgePrice: 0,
  name: "Migration Contest Participated Holder",
  NFT: ethers.constants.AddressZero,
  groupId: 1,
  symbol: "MCPH",
  URI: "https://thumbs2.imgbox.com/94/6d/tKPWM0zS_t.png",
  description:
    "Thank you for learning about our Migration, and make a cool contents!",
};

const BADGE3 = {
  requiredQuests: [1, 0, 0],
  engagePointsThreshold: 10,
  badgePrice: ethers.utils.parseEther("0.2"),
  name: "Funding for club : The professors",
  NFT: ethers.constants.AddressZero,
  groupId: 1,
  symbol: "FP1",
  URI: "https://powered.by.dustlabs.com/cdn-cgi/image/width=640/https://static.y00ts.com/clubs/the_professors.webp",
  description:
    "A club for the professorial clothed y00ts. Our vision is to engage college campus communities across the globe in the y00ts ecosystem.",
};

const FAKE_USERS = [
  {
    username: "metalboyrick1",
    name: "Rick1",
    description: "dummy",
    image: "none",
    discord: {
      id: "none",
      username: "none",
      discriminator: "none",
    },
    twitter: "none",
  },

  {
    username: "metalboyrick2",
    name: "Rick2",
    description: "dummy",
    image: "none",
    discord: {
      id: "none",
      username: "none",
      discriminator: "none",
    },
    twitter: "none",
  },
  {
    username: "metalboyrick3",
    name: "Rick3",
    description: "dummy",
    image: "none",
    discord: {
      id: "none",
      username: "none",
      discriminator: "none",
    },
    twitter: "none",
  },
];
// import
const deployAll = async () => {
  const { deployerAddr, governorAddr } = await getNamedAccounts();
  const sDeployer = await ethers.getSigner(deployerAddr);
  const sGovernor = await ethers.getSigner(governorAddr);

  await deployWithConfirmation(`DroppinDiamondInit`);
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

  const cBadgeFacetProxy = await ethers.getContractAt(
    "BadgeFacet",
    dDroppin.address
  );

  console.log("CONTRACT OWNER: ", await cOwnershipProxy.owner());

  const cCoreFacetProxy = await ethers.getContractAt(
    "CoreFacet",
    dDroppin.address
  );

  // DEV // SCRIPTS FOR DEMO
  // ----------- REGISTER USER
  USER1_DETAIL.address = deployerAddr;
  await callToServer("sign-up", USER1_DETAIL);

  // ----------- CREATE A GROUP
  let tx = await cCoreFacetProxy
    .connect(sDeployer)
    .createGroup(formatBytes32String(GROUP1.name));
  let receipt = await tx.wait();
  const groupData = GROUP1;
  groupData.transactionHash = receipt.transactionHash;
  await callToServer("create-group", groupData);

  // ----------- ADD QUEST

  tx = await cCoreFacetProxy.addQuest({
    name: formatBytes32String(QUEST1.name),
    groupId: 1,
    engagePoints: QUEST1.engagePoints,
  });
  receipt = await tx.wait();
  let questData = QUEST1;
  questData.transactionHash = receipt.transactionHash;
  await callToServer("create-quest", questData);

  tx = await cCoreFacetProxy.addQuest({
    name: formatBytes32String(QUEST2.name),
    groupId: 1,
    engagePoints: QUEST2.engagePoints,
  });
  receipt = await tx.wait();
  questData = QUEST2;
  questData.transactionHash = receipt.transactionHash;
  await callToServer("create-quest", questData);

  // ---------CREATE BADGE
  tx = await cBadgeFacetProxy.addBadge(BADGE1, BADGE1.symbol, BADGE1.URI);
  receipt = await tx.wait();
  let badgeData = BADGE1;
  badgeData.transactionHash = receipt.transactionHash;
  await callToServer("create-badge", badgeData);

  tx = await cBadgeFacetProxy.addBadge(BADGE2, BADGE2.symbol, BADGE2.URI);
  receipt = await tx.wait();
  badgeData = BADGE2;
  badgeData.transactionHash = receipt.transactionHash;
  await callToServer("create-badge", badgeData);

  tx = await cBadgeFacetProxy.addBadge(BADGE3, BADGE3.symbol, BADGE3.URI);
  receipt = await tx.wait();
  badgeData = BADGE3;
  badgeData.transactionHash = receipt.transactionHash;
  await callToServer("create-badge", badgeData);

  // ---------REGISTER OTHER FAKE USERS
  const signers = await ethers.getSigners();

  for (let i = 0; i < FAKE_USERS.length; i++) {
    const userData = FAKE_USERS[i];
    userData.address = signers[2 + i].address;
    await callToServer("sign-up", userData);
  }

  // ---------COMPLETE QUEST FOR USERS

  for (let i = 0; i < FAKE_USERS.length; i++) {
    await callToServer("complete-quest", {
      questId: 1,
      username: FAKE_USERS[i].username,
    });
    await callToServer("complete-quest", {
      questId: 2,
      username: FAKE_USERS[i].username,
    });
  }
  // ---------CLAIM BADGE FOR USERS
  for (let i = 0; i < FAKE_USERS.length; i++) {
    tx = await cBadgeFacetProxy.connect(signers[i + 2]).claimBadge(1);
    receipt = await tx.wait();
    await callToServer("complete-badge", {
      transactionHash: receipt.transactionHash,
    });
  }
  return;
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
  // const badgeData = {
  //   requiredQuests: [1, 4, 0],
  //   engagePointsThreshold: 500,
  //   badgePrice: parseEther("0.01"),
  //   name: "Hacker Badge",
  //   NFT: ethers.constants.AddressZero,
  //   groupId: 1,
  //   owner: sDeployer,
  //   symbol: "HACK",
  //   URI: "www.google.com",
  // };
  // tx = await cBadgeFacetProxy
  //   .connect(badgeData.owner)
  //   .addBadge(badgeData, badgeData.symbol, badgeData.URI);
  // receipt = await tx.wait();
  // console.log("Create badge Tx : ", receipt.transactionHash);
  // user completes the quests required
  // tx = await cCoreFacetProxy.completeQuest(1, sDeployer.address);
  // await tx.wait();
  // tx = await cCoreFacetProxy.completeQuest(4, sDeployer.address);
  // await tx.wait();

  // tx = await cBadgeFacetProxy.claimBadge(1, { value: parseEther("0.01") });
  // receipt = await tx.wait();
  // console.log("Claim badge tx: ", receipt.transactionHash);
};

const main = async () => {
  await deployAll();
};

main.id = "001_core";
main.skip = () => isLocalHost;
module.exports = main;
