pragma solidity ^0.8.0;

import "./Storage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
/**
**  @dev Droppin Protocol
**  @author Carlos Ramos
*/
contract Droppin {
    using Counters for Counters.Counter;
    Counters.Counter internal groupIds;
    mapping(uint256 => GroupData) groupById;
    mapping(address => uint256[]) groupByUser;
    mapping(address => Counters.Counter) groupByUserCounter;
    constructor () {
        groupIds.increment();
    }

    function createGroup(GroupData memory _newGroup) external {
        groupById[groupIds.current()] = _newGroup;
        groupByUserCounter[msg.sender].increment();
        groupByUser[msg.sender].push(groupIds.current());
    }

    // function addCondition(uint256 _groupId, bytes memory _schemaHash) external {

    // }


}