pragma solidity ^0.8.0;

import {LibDiamond} from "../lib/LibDiamond.sol";
// import counter as we using their library
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CoreFacet {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    event GroupCreated(uint256 id, address creator);
    event QuestCreated(LibCoreFacet.QuestData questData, uint256 id);
    event GroupModified(uint256 id, address newOwner);
    event QuestComplete(uint256 groupId, address userAddr, uint256 engageScore);
    function createGroup(bytes32 name) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        ds.groupIds.increment();
        ds.groupById[ds.groupIds.current()].name = name;
        ds.groupById[ds.groupIds.current()].owner = msg.sender;
        emit GroupCreated(ds.groupIds.current(), msg.sender);
    }   

    function addQuest(LibCoreFacet.QuestData memory _questData) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        // LibCoreFacet.enforceGroupOwner(_questData.groupId, msg.sender);
        ds.questIds.increment();
        ds.questById[ds.questIds.current()].name = _questData.name;
        ds.questById[ds.questIds.current()].groupId = _questData.groupId;
        ds.questById[ds.questIds.current()].engagePoints = _questData
            .engagePoints;
        emit QuestCreated(ds.questById[ds.questIds.current()], ds.questIds.current());
    }

    function modifyGroup(
        uint256 _groupId,
        bytes32 _newName,
        address _newOwner
    ) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        LibCoreFacet.enforceGroupOwner(_groupId, msg.sender);
        ds.groupById[_groupId].name = _newName;
        ds.groupById[_groupId].owner = _newOwner;
        emit GroupModified(_groupId, _newOwner);
    }

    // droppin server is the only allowed to call this. 
    function completeQuest(uint256 _questId, address userAddr) external {
        // LibDiamond.enforceIsContractOwner();

        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        require(
            ds.isCompletedByUser[_questId][userAddr] == false,
            "user has already completed this quest"
        );
        ds.isCompletedByUser[_questId][userAddr] = true;
        ds.userEngagePoints[ds.questById[_questId].groupId][userAddr] += (
            ds.questById[_questId].engagePoints
        );
        emit QuestComplete(ds.questById[_questId].groupId,userAddr, ds.questById[_questId].engagePoints);
    }

    function getGroup(uint256 _groupId)
        external
        view
        returns (LibCoreFacet.GroupData memory)
    {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (ds.groupById[_groupId]);
    }

    function getQuest(uint256 _questId)
        external
        view
        returns (LibCoreFacet.QuestData memory)
    {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (ds.questById[_questId]);
    }

    function getUserEngagePoint(uint256 _groupId)
        external
        view
        returns (uint256)
    {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (ds.userEngagePoints[_groupId][msg.sender]);
    }
}
