pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

library LibStore {
    using Counters for Counters.Counter;
    error ItemNotSoldAtStore();
    error ItemNotAvailable();
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("droppinprotocol.com.main.storage");
}
