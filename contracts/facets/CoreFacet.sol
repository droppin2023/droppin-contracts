pragma solidity ^0.8.0;

import { LibDiamond } from "../lib/LibDiamond.sol";
// import counter as we using their library
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";

struct GroupData {
    bytes32 name;
    address owner;
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
    function modifyGroup(uint256 _groupId,bytes32 _newName, address _newOwner) external {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        LibCoreFacet.IsGroupOwner(_groupId,msg.sender);
        ds.groupById[_groupId].name = _newName;
        ds.groupById[_groupId].owner = _newOwner;
    }
    function getGroup(uint256 _groupId) external view returns (GroupData memory) {
        LibCoreFacet.CoreState storage ds = LibCoreFacet.diamondStorage();
        return (GroupData(ds.groupById[_groupId].name, ds.groupById[_groupId].owner));
    }
}