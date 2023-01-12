pragma solidity ^0.8.0;

struct QuestData {
    bytes32 description;
    bytes32 name;
    uint256 reputation;
    uint256[] conditionIds;
}

struct RoleData {
    bytes32 name;
    uint256 threshold;
    uint256[] preConditionIdx;
}

struct GroupData {
    bytes32 name;
    bytes32 description;
}

struct GameData {
    bytes32 name;
    bytes32 description;
    address contractSrc; // contract that calls addReputation()
}

contract Storage {}
