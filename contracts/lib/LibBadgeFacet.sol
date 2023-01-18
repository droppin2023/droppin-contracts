pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

library LibBadgeFacet {
    using Counters for Counters.Counter;

    struct BadgeData {
        uint256[3] requiredQuests;
        uint256 engagePointsThreshold;
        uint256 badgePrice; // ether
        string name;
        address NFT;
        uint256 groupId;
    }
    using Counters for Counters.Counter;
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage.badge");
    struct BadgeState {
        Counters.Counter badgeIds;
        mapping(uint256 => BadgeData) badgesById;
        mapping(uint256 => uint256) mainBadgeOfGroup;
    }

    function diamondStorage() internal pure returns (BadgeState storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function isMemberOfGroup(address _user, uint256 _groupId)
        internal
        view
        returns (bool)
    {
        require(
            IERC721(
                diamondStorage()
                    .badgesById[diamondStorage().mainBadgeOfGroup[_groupId]]
                    .NFT
            ).balanceOf(_user) > 0,
            "User doesnt hold main badge of this community"
        );
        return true;
    }
}
