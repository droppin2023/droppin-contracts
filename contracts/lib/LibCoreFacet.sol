pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

library LibCoreFacet {
    struct GroupData {
        bytes32 name;
        address owner;
    }
    struct QuestData {
        bytes32 name;
        uint256 groupId;
        uint256 engagePoints;
    }

    using Counters for Counters.Counter;
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage.core");
    struct CoreState {
        Counters.Counter groupIds;
        Counters.Counter questIds; // PolygonId Requests are the same 1 to 1
        mapping(uint256 => GroupData) groupById;
        mapping(uint256 => QuestData) questById;
        mapping(uint256 => mapping(address => bool)) isCompletedByUser; // with quest id
        mapping(uint256 => mapping(address => uint256)) userEngagePoints;
    }

    function diamondStorage() internal pure returns (CoreState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function enforceGroupOwner(uint256 _groupId, address _owner) internal view {
        require(_groupId != 0, "group id cannot be 0");
        require(_owner != address(0), "owner address cannot be 0");
        require(
            diamondStorage().groupById[_groupId].owner == _owner,
            "caller is not the owner of the group"
        );
    }

    function enforceOwnerOfQuest(uint256 _questId, address _owner)
        internal
        view
    {
        require(_owner != address(0), "owner address cannot be 0");
        require(
            diamondStorage()
                .groupById[diamondStorage().questById[_questId].groupId]
                .owner == _owner,
            "caller is not the owner of the group"
        );
    }
}
