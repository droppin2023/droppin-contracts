pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

struct GroupData {
    bytes32 name;
    address owner;
}
library LibCoreFacet {

    using Counters for Counters.Counter;
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.diamond.storage.core");
    struct CoreState {
        Counters.Counter groupIds;
        mapping(uint256 => GroupData) groupById;
    }

    function diamondStorage() internal pure returns (CoreState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
    function IsGroupOwner(uint256 _groupId, address owner) internal view {
        require(_groupId != 0, "group id cannot be 0");
        require(owner != address(0), "owner address cannot be 0");
        require(diamondStorage().groupById[_groupId].owner == owner, "caller is not the owner of the group");
    }
}