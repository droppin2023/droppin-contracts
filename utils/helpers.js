const { createFixtureLoader } = require("ethereum-waffle");

const {addresses} = require("../utils/addresses");
const forkedNetwork = process.env.NETWORK;
const isPolygon = hre.network.name === "polygon" || forkedNetwork == "polygon";
const isMainnet = hre.network.name === "mainnet" || forkedNetwork == "mainnet";
const isLocalHost = hre.network.name === "hardhat";
console.log(hre.network.name);
const isFork = hre.network.name == "localhost";

const circuitId = "credentialAtomicQuerySig";
const validatorAddresss = "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB";

const getTokenAddresses = async (deployments) => {
  if (isPolygon) {
    return {
      USDT: addresses.polygon.USDT,
      USDC: addresses.polygon.USDC,
      DAI: addresses.polygon.DAI,
    };
  }
};
const loadFixture = createFixtureLoader(
  [
    hre.ethers.provider.getSigner(0),
    hre.ethers.provider.getSigner(1),
    hre.ethers.provider.getSigner(2),
    hre.ethers.provider.getSigner(3),
    hre.ethers.provider.getSigner(4),
    hre.ethers.provider.getSigner(5),
    hre.ethers.provider.getSigner(6),
    hre.ethers.provider.getSigner(7),
    hre.ethers.provider.getSigner(8),
    hre.ethers.provider.getSigner(9),
  ],
  hre.ethers.provider
);

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function fromLittleEndian(bytes) {
  const n256 = BigInt(256);
  let result = BigInt(0);
  let base = BigInt(1);
  bytes.forEach((byte) => {
    result += base * BigInt(byte);
    base = base * n256;
  });
  return result;
}

module.exports = {
  getTokenAddresses,
  isPolygon,
  isMainnet,
  isLocalHost,
  isFork,
  forkedNetwork,
  loadFixture,
  hexToBytes,
  fromLittleEndian,
  validatorAddresss,
  circuitId
};
