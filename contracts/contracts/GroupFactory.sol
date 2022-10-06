// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import { Group } from "./Group.sol";
import { Structs } from "./libraries/ShareRevStructs.sol";


/// @custom:security-contact ReceptionFM
contract GroupFactory is Initializable, PausableUpgradeable, AccessControlUpgradeable  {
  using CountersUpgradeable for CountersUpgradeable.Counter;

  CountersUpgradeable.Counter private groupIndex;
  address contractOwner;
  uint256 public cost;


  event GroupCreate(address sender, uint256 groupIndex);
  event MembershipUpdate(address groupAddress, uint256 groupIndex, address[] allocation);
  event CostChange(uint256 cost);

  mapping(uint256 => address) groupIndexToAddress;
  mapping(address => address[]) groupAddressToMembers;
  mapping(uint256 => bool) groupIndexUsed;
  
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  constructor(address _ContractOwner) initializer{
    
    __AccessControl_init();
    __Pausable_init();

    require(_ContractOwner != address(0), "owner required");
    _grantRole(ADMIN_ROLE, _ContractOwner);
    _grantRole(DEFAULT_ADMIN_ROLE, _ContractOwner);

    contractOwner = _ContractOwner;
    cost = 0;
  }
  
  function initialize(address _ContractOwner) initializer external {
    __AccessControl_init();
    __Pausable_init();

    _grantRole(ADMIN_ROLE, _ContractOwner);
    _grantRole(DEFAULT_ADMIN_ROLE, _ContractOwner);
  }

  function withdrawBalance() external onlyRole(ADMIN_ROLE) {
    address payable ownerPayable = payable(contractOwner);
    // send all Ether to owner
    // Owner can receive Ether since the address of owner is payable
    ownerPayable.transfer(address(this).balance);
  }

  function setCost(uint256 tempCost) external onlyRole(ADMIN_ROLE) {
    cost = tempCost;
    emit CostChange(cost);
  }

  function createGroupContract(string memory _name) external payable{
    require(msg.value >= cost, "Not enough MATIC to complete transaction");
    uint256 _groupIndex = groupIndex.current();
    Group child = new Group(_name, _groupIndex, msg.sender);
    //children.push(child);
    //uint256 tokenIndex = children.length;
    groupIndex.increment();
    groupIndexToAddress[_groupIndex] = address(child);
    groupIndexUsed[_groupIndex] = true;
    groupAddressToMembers[address(child)] = [msg.sender];
    emit GroupCreate(msg.sender, _groupIndex);
  }

  function getGroupContractCount() external view returns(uint256) {
    return groupIndex.current();
  }

  function getGroupContract(uint256 groupId) external view returns(address) {
    address groupAddress = groupIndexToAddress[groupId];
    require(groupAddress != address(0), 'Group does not exist');
    return groupAddress;
  }

  function updateGroupMembership(uint256 groupId, address[] calldata memberList) external {
    require(groupIndexToAddress[groupId] == msg.sender, 'Only a group contract can update membership');
    groupAddressToMembers[msg.sender] = memberList;
    emit MembershipUpdate(msg.sender, groupId, memberList);
  }
}