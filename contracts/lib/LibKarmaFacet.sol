pragma solidity ^0.8.0;

library LibKarmaFacet {

  bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("droppinprotocol.com.diamond.storage.karma");
  struct karma {
      string butcherName;
  }

  function diamondStorage() internal pure returns (karma storage ds) {
      bytes32 position = DIAMOND_STORAGE_POSITION;
      assembly {
          ds.slot := position
      }
  }

  function setButcherName (string memory _butcherName) internal {
    karma storage storeState = diamondStorage();
    storeState.butcherName = _butcherName;
  }

  function getButcherName() internal view returns (string memory) {
    karma storage storeState = diamondStorage();
    return storeState.butcherName;
  }

}