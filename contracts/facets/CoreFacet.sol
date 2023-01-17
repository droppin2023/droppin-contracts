pragma solidity ^0.8.0;

import { LibDiamond } from "../lib/LibDiamond.sol";
// import counter as we using their library
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";

struct GroupData {
    bytes32 name;
    address owner;
}
struct QuestData {
    bytes32 name;
    uint256 groupId;
} 
contract CoreFacet {

    using Counters for Counters.Counter;
    event groupCreated(uint256 _id,address _creator);
    function createGroup(bytes32 name) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        ds.groupIds.increment();
        ds.groupById[ds.groupIds.current()].name = name;
        ds.groupById[ds.groupIds.current()].owner = msg.sender;
    }
    function addQuest(uint256 _groupId, bytes32 name) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        LibCoreFacet.enforceGroupOwner(_groupId, msg.sender);
        ds.questIds.increment();
        ds.questById[ds.questIds.current()].name = name;
        ds.questById[ds.questIds.current()].groupId = _groupId;
    }
    function modifyGroup(uint256 _groupId,bytes32 _newName, address _newOwner) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        LibCoreFacet.enforceGroupOwner(_groupId,msg.sender);
        ds.groupById[_groupId].name = _newName;
        ds.groupById[_groupId].owner = _newOwner;
    }
    function getGroup(uint256 _groupId) external view returns (GroupData memory) {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (GroupData(ds.groupById[_groupId].name, ds.groupById[_groupId].owner));
    }
    function getQuest(uint256 _questId) external view returns (QuestData memory) {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (QuestData(ds.questById[_questId].name, ds.questById[_questId].groupId));
    }
}