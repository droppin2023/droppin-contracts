pragma solidity ^0.8.0;

import {LibBadgeFacet} from "../lib/LibBadgeFacet.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";
import {NFTBadge} from "../NFTBadge.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

contract BadgeFacet {
    using Counters for Counters.Counter;

    function addBadge(
        uint256 _groupId,
        LibBadgeFacet.BadgeData memory _badgeData,
        string calldata _nftSymbol,
        string calldata _nftInitBaseURI
    ) external {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        ds.badgeIds.increment();
        LibCoreFacet.enforceGroupOwner(_groupId, msg.sender);
        uint256[3] memory requiredQuests;
        for (uint256 i = 0; i < _badgeData.requiredQuests.length; i++) {
            if (_badgeData.requiredQuests[i] != 0) {
                LibCoreFacet.enforceOwnerOfQuest(
                    _badgeData.requiredQuests[i],
                    msg.sender
                );
            }
            requiredQuests[i] = _badgeData.requiredQuests[i];
        }
        ds.badgesById[ds.badgeIds.current()].requiredQuests = requiredQuests;
        ds.badgesById[ds.badgeIds.current()].reputationThreshold = _badgeData
            .reputationThreshold;
        ds.badgesById[ds.badgeIds.current()].badgePrice = _badgeData.badgePrice;
        ds.badgesById[ds.badgeIds.current()].name = _badgeData.name;
        ds.badgesById[ds.badgeIds.current()].NFT = address(
            new NFTBadge(_badgeData.name, _nftSymbol, _nftInitBaseURI)
        );
    }

    //TODO
    function claimBadge(uint256 _badgeId) external {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        NFTBadge(ds.badgesById[_badgeId].NFT).mint(msg.sender);
    }

    function getBadge(uint256 _badgeId)
        external
        view
        returns (LibBadgeFacet.BadgeData memory)
    {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        return (ds.badgesById[_badgeId]);
    }
}
