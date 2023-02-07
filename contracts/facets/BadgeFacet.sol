pragma solidity ^0.8.0;

import {LibBadgeFacet} from "../lib/LibBadgeFacet.sol";
import {LibCoreFacet} from "../lib/LibCoreFacet.sol";
import {NFTBadge} from "../NFTBadge.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../lib/GenesisUtils.sol";
import "../verifiers/ZKPVerifier.sol";
import "../interfaces/ICircuitValidator.sol";

contract BadgeFacet is ZKPVerifier {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    mapping(uint256 => address) public idToAddress;
    mapping(address => uint256) public addressToId;

    event BadgeCreated(
        LibBadgeFacet.BadgeData badgeData,
        string nftSymbol,
        string nftInitBaseURI,
        uint256 id
    );

    constructor(address _validatorAddr) {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        ds.validatorAddr = _validatorAddr;
    }

    function addBadge(
        LibBadgeFacet.BadgeData memory _badgeData,
        string calldata _nftSymbol,
        string calldata _nftInitBaseURI
    ) external {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        ds.badgeIds.increment();
        LibCoreFacet.enforceGroupOwner(_badgeData.groupId, msg.sender);
        uint256[3] memory requiredQuests;
        for (uint256 i = 0; i < _badgeData.requiredQuests.length; i++) {
            // if (_badgeData.requiredQuests[i] > 0) {
            //     LibCoreFacet.enforceOwnerOfQuest(
            //         _badgeData.requiredQuests[i],
            //         msg.sender
            //     );
            // }
            //ALLOWS QUESTS FROM DIFF GROUPS IN SAME BADGE
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
        ds.badgesById[ds.badgeIds.current()].schemaHash = _badgeData.schemaHash;

        //store id of badge for group
        uint256 mainBadgeOfGroup = ds.mainBadgeOfGroup[_badgeData.groupId];
        if (mainBadgeOfGroup == 0) {
            ds.mainBadgeOfGroup[_badgeData.groupId] = ds.badgeIds.current();
        }

        // ADD ZKP REQUEST IF NOT EXISTENT
        ds.requestIds.increment();
        setZKPRequest(
            uint64(ds.requestIds.current()),
            ICircuitValidator(ds.validatorAddr),
            createQuery(1, 1, _badgeData.schemaHash)
        );
        ds.badgeOfRequest[ds.requestIds.current()] = ds.badgeIds.current();
        emit BadgeCreated(
            ds.badgesById[ds.badgeIds.current()],
            _nftSymbol,
            _nftInitBaseURI,
            ds.badgeIds.current()
        );
    }

    function setValidator (address _validator) external {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        ds.validatorAddr = _validator;
    }

    //TODO
    function claimBadge(uint256 _badgeId) internal {
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

    function getBadge(
        uint256 _badgeId
    ) external view returns (LibBadgeFacet.BadgeData memory) {
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();
        return (ds.badgesById[_badgeId]);
    }

    function _beforeProofSubmit(
        uint64 /* requestId */,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal view override {
        // check that challenge input of the proof is equal to the msg.sender
        address addr = GenesisUtils.int256ToAddress(
            inputs[validator.getChallengeInputIndex()]
        );
        require(
            _msgSender() == addr,
            "address in proof is not a sender address"
        );
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        require(
            addressToId[_msgSender()] == 0,
            "proof can not be submitted more than once"
        );

        uint256 id = inputs[validator.getChallengeInputIndex()];
        // execute the airdrop
        LibBadgeFacet.BadgeState storage ds = LibBadgeFacet.diamondStorage();

        if (idToAddress[id] == address(0)) {
            claimBadge(ds.badgeOfRequest[requestId]);
            addressToId[_msgSender()] = id;
            idToAddress[id] = _msgSender();
        }
    }

    function createQuery(
        uint256 _queryType,
        uint256 _value,
        uint256 _schemaHash
    ) internal pure returns (ICircuitValidator.CircuitQuery memory) {
        uint256[] memory value;
        value = new uint256[](64);
        value[0] = _value;
        if (_queryType == 1) {
            return
                ICircuitValidator.CircuitQuery(
                    _schemaHash,
                    2,
                    1,
                    value,
                    "credentialAtomicQuerySig"
                );
        }
        return
            ICircuitValidator.CircuitQuery(
                _schemaHash,
                2,
                2,
                value,
                "credentialAtomicQuerySig"
            );
    }
}
