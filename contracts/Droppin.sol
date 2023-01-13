pragma solidity ^0.8.0;

import "./Storage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./verifiers/ZKPVerifier.sol";
import "./interfaces/ICircuitValidator.sol";
/**
**  @dev Droppin Protocol
**  @author Carlos Ramos
**  @note Most of the mapping data can be stored off chain for better performance
*/
contract Droppin is ZKPVerifier{
    using Counters for Counters.Counter;

    Counters.Counter internal groupIds;
    Counters.Counter internal conditionIds;
    Counters.Counter internal verifierRequestIds;
    Counters.Counter internal questIds;

    //data for verification constant
    address internal validatorAddr;
    string internal circuitId;
    uint256 internal slotIndex;
    uint256 internal operatorId;
    uint256[] internal value;

    mapping(uint256 => GroupData) public groupById;
    mapping(address => Counters.Counter) public groupByUserCounter;
    mapping(uint256 => ConditionData) public conditionsById;
    mapping(uint256 => QuestData) public questsById;

    constructor(address _validatorAddr, string memory _circuitId) {
        validatorAddr = _validatorAddr;
        circuitId = _circuitId;
        slotIndex = 2;
        operatorId = 1;
        value = new uint256[](64);
        value[0] = 1;
    }

    function createGroup(GroupData memory _newGroup) external {
        groupIds.increment();
        groupById[groupIds.current()] = _newGroup;
        groupByUserCounter[_newGroup.owner].increment();
    }


    function addCondition(uint256 _groupId, uint256 _schemaHash) external {
        _IsGroupOwner(msg.sender,_groupId);
        conditionIds.increment();
        verifierRequestIds.increment();
        conditionsById[conditionIds.current()] = ConditionData(_groupId,verifierRequestIds.current());
        //TODO : fix parsing issue from bigger int to small one, might cause problem in the future
        setZKPRequest(uint64(verifierRequestIds.current()), ICircuitValidator(validatorAddr), ICircuitValidator.CircuitQuery(_schemaHash,slotIndex,operatorId,value,circuitId));
    }

    function addQuest(uint256[] memory _conditions, bytes calldata _initParams) external {
        require(_conditions.length < 4, "number of conditions should be 3 or less");
        questIds.increment();
        verifierRequestIds.increment();
        (
            bytes32 name,
            uint256 reputation,
            uint256 groupId,
            uint256 schemaHash
        ) = abi.decode(_initParams,(bytes32,uint256,uint256,uint256));
        
        _IsGroupOwner(msg.sender, groupId);

        uint256[3] memory conditions;
        for(uint256 i=0 ; i < _conditions.length; i++){
            conditions[i] = _conditions[i];
        }

        setZKPRequest(uint64(verifierRequestIds.current()), ICircuitValidator(validatorAddr), ICircuitValidator.CircuitQuery(schemaHash,slotIndex,operatorId,value,circuitId));
        questsById[questIds.current()] = QuestData(name,reputation,groupId,conditions,verifierRequestIds.current());

    }

    function _IsGroupOwner (address _user, uint256 _groupId) internal view {
        require (groupById[_groupId].owner == _user, "caller is not the owner of this group");
        return ;
    }

}