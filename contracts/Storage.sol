pragma solidity ^0.8.0;

struct QuestData {
    bytes32 name;
    uint256 reputation;
    uint256 groupId;
    uint256[3] conditionIds;
    uint256 requestId;
}

struct RoleData {
    bytes32 name;
    uint256 threshold;
    uint256[] preConditionIdx;
}

struct GroupData {
    bytes32 name;
    bytes32 description;
    address owner;
}

struct GameData {
    bytes32 name;
    bytes32 description;
    address contractSrc; // contract that calls addReputation()
}

struct ConditionData {
    uint256 groupId;
    uint256 requestId; // verifier request id
}

contract Storage {}
