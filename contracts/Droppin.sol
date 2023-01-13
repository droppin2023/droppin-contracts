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

    address internal validatorAddr;
    string internal circuitId;

    mapping(uint256 => GroupData) public groupById;
    mapping(address => Counters.Counter) public groupByUserCounter;
    mapping(uint256 => ConditionData) public conditionsById;

    constructor(address _validatorAddr, string memory _circuitId) {
        validatorAddr = _validatorAddr;
        circuitId = _circuitId;
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
        conditionsById[conditionIds.current()] = ConditionData(_groupId,_schemaHash);
        // query is fixed to 1 attribute which is boolean and also is equal to 1
        uint256[] memory value = new uint256[](64);
        value[0] = 1;

        //TODO : fix parsing issue from bigger int to small one, might cause problem in the future
        setZKPRequest(uint64(verifierRequestIds.current()), ICircuitValidator(validatorAddr), ICircuitValidator.CircuitQuery(_schemaHash,2,1,value,circuitId));
        
    }

    function _IsGroupOwner (address _user, uint256 _groupId) internal view {
        require (groupById[_groupId].owner == _user, "caller is not the owner of this group");
        return ;
    }

}