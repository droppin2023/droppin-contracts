const { createFixtureLoader } = require("ethereum-waffle");
const hre = require("hardhat");
const { addresses } = require("../utils/addresses");
const axios = require("axios");
const forkedNetwork = process.env.NETWORK;
const isPolygon = hre.network.name === "polygon" || forkedNetwork === "polygon";
const isMainnet = hre.network.name === "mainnet" || forkedNetwork === "mainnet";
const isLocalHost = hre.network.name === "hardhat";
console.log(hre.network.name);
const isFork = hre.network.name === "localhost";
const SERVER_URL = process.env.SERVER_URL;
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

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

// get function selectors from ABI
function getSelectors(contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

function remove(functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

function getSelector(func) {
  const abiInterface = new hre.ethers.utils.Interface([func]);
  return abiInterface.getSighash(hre.ethers.utils.Fragment.from(func));
}
async function callToServer(method, params) {
  await axios.post(`${SERVER_URL}/${method}`, params);
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
  circuitId,
  FacetCutAction,
  getSelectors,
  callToServer,
};
