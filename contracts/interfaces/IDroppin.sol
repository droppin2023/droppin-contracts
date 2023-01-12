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
interface IDroppin {

    function createGroup(GroupData memory _newGroup) external;
    function addRole(RoleData memory _newRole, uint256 _groupId) external;
    function addCondition(uint256 _groupId, bytes memory _schemaHash) external;
    function verifyCondition(bytes memory proof, uint256 _groupId, uint256 _conditionId) external;
    function createQuest(QuestData memory _newQuest) external;
    function completeQuest(uint256 _questId) external;
    function addReputation(address[] memory _users) external; // comes from game's SCs 

    //view functions 
    function getRole(address _user, uint256 _groupId) external returns(RoleData memory);
    function getGameReputation(address _user, address _gameSrc) external returns (uint256);
    function getWeightedGameReputation(address _user, address _gameSrc) external returns (uint256);
}
