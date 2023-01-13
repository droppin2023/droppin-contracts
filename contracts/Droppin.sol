pragma solidity ^0.8.0;

import "./Storage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
/**
**  @dev Droppin Protocol
**  @author Carlos Ramos
**  @note Most of the mapping data can be stored off chain for better performance
*/
contract Droppin {
    using Counters for Counters.Counter;

    Counters.Counter internal groupIds;
    Counters.Counter internal conditionIds;

    mapping(uint256 => GroupData) groupById;
    mapping(address => Counters.Counter) groupByUserCounter;
    mapping(uint256 => ConditionData) conditionsById;

    constructor () {
        groupIds.increment();
    }

    function createGroup(GroupData memory _newGroup) external {
        groupById[groupIds.current()] = _newGroup;
        groupByUserCounter[msg.sender].increment();
    }

    function addCondition(uint256 _groupId, ConditionData memory _newCondition) external {
        _IsGroupOwner(msg.sender,_groupId);
        conditionIds.increment();
        conditionsById[conditionIds.current()] = ConditionData(_groupId,_newCondition.schemaHash);
    }

    function _IsGroupOwner (address _user, uint256 _groupId) internal view {
        require (groupById[_groupId].owner == _user, "caller is not the owner of this group");
        return ;
    }

}