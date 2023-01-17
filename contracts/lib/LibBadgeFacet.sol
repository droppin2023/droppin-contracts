pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

library LibBadgeFacet {
    using Counters for Counters.Counter;
    
    struct BadgeData {
        uint256[3] requiredQuests;
        uint256 reputationThreshold;
        uint256 badgePrice;
        string name;
        address NFT;
    }
    using Counters for Counters.Counter;
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage.badge");
    struct BadgeState {
        Counters.Counter badgeIds;
        mapping(uint256 => BadgeData) badgesById;
    }

    function diamondStorage() internal pure returns (BadgeState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
