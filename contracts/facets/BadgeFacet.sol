pragma solidity ^0.8.0;

import {LibBadgeFacet} from "../lib/LibBadgeFacet.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";
import {NFTBadge} from "../NFTBadge.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BadgeFacet {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    function addBadge(
        LibBadgeFacet.BadgeData memory _badgeData,
        string calldata _nftSymbol,
        string calldata _nftInitBaseURI
    ) external {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        LibCoreFacet.CoreState storage cds = LibCoreFacet.diamondStorage();
        ds.badgeIds.increment();
        LibCoreFacet.enforceGroupOwner(_badgeData.groupId, msg.sender);
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
        ds.badgesById[ds.badgeIds.current()].engagePointsThreshold = _badgeData
            .engagePointsThreshold;
        ds.badgesById[ds.badgeIds.current()].badgePrice = _badgeData.badgePrice;
        ds.badgesById[ds.badgeIds.current()].name = _badgeData.name;
        ds.badgesById[ds.badgeIds.current()].groupId = _badgeData.groupId;
        ds.badgesById[ds.badgeIds.current()].NFT = address(
            new NFTBadge(_badgeData.name, _nftSymbol, _nftInitBaseURI)
        );

        //store id of badge for group
        uint256 mainBadgeOfGroup = ds.mainBadgeOfGroup[_badgeData.groupId];
        if (mainBadgeOfGroup == 0) {
            ds.mainBadgeOfGroup[_badgeData.groupId] = ds.badgeIds.current();
        }
    }

    //TODO
    function claimBadge(uint256 _badgeId) external payable {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        LibCoreFacet.CoreState storage cds = LibCoreFacet.diamondStorage();

        //check if requiredQuests
        uint256[3] memory requiredQuests = ds
            .badgesById[_badgeId]
            .requiredQuests;
        for (uint256 i = 0; i < requiredQuests.length; i++) {
            if (requiredQuests[i] != 0) {
                require(
                    cds.isCompletedByUser[requiredQuests[i]][msg.sender],
                    "user has not complete all quests"
                );
            }
        }
        uint256 engageThreshold = ds.badgesById[_badgeId].engagePointsThreshold;
        if (engageThreshold > 0) {
            require(
                cds.userEngagePoints[ds.badgesById[_badgeId].groupId][
                    msg.sender
                ] >= engageThreshold,
                "user doesnt have enough engage points to claim this badge"
            );
        }
        uint256 badgePrice = ds.badgesById[_badgeId].badgePrice;
        if (badgePrice > 0) {
            require(
                msg.value >= badgePrice,
                "not enought ether to obtain this badge"
            );
        }
        NFTBadge(ds.badgesById[_badgeId].NFT).mint(msg.sender);
    }

    function isMemberOfGroup(uint256 _groupId) external view returns (bool) {
        return (LibBadgeFacet.isMemberOfGroup(msg.sender, _groupId));
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
