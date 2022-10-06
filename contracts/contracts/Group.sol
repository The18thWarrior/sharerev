// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
//import "hardhat/console.sol";
import { Structs } from "./libraries/ShareRevStructs.sol";
import { GroupFactory } from './GroupFactory.sol';

/// @custom:security-contact ReceptionFM
contract Group is Initializable, PausableUpgradeable, AccessControlUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  //using Strings2 for *;
  bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  string public name;
  address private owner;
  uint256 public groupIndex;
  address private creatingContract;
  uint256 private allocationTotal = 1000000;
  GroupFactory private groupFactory;
  Structs.VotingType public votingType;
  CountersUpgradeable.Counter public votingIndex;
  
  event GroupCreate(address sender, uint256 groupIndex);
  event GroupVoteInitiate(address sender, uint256 voteId);
  event GroupVoteCompleted(uint256 voteId);
  event GroupMemberWithdrawal(address sender, uint256 amount);
  event GroupDeposit(address sender, uint256 amount);

  // ============ Structs ============
  address[] private memberList;
  mapping(address => uint256) private memberBalance;
  mapping(address => uint256) public allocation;  
  mapping(uint256 => GroupVote) public voteList;

  struct GroupVote {
    // ID of vote request
    uint256 voteIndex;
    // Action Type
    Structs.ActionType requestType;
    // New Allocation
    mapping(address => uint256) allocation;
    // Voting Type Change
    Structs.VotingType votingType;
    // Member List
    address[] memberList;
    // Voting Member list
    address[] votingMemberList;
    // Vote Results
    mapping(address => Structs.VoteOutcome) votes;
    // Outcome
    Structs.VoteOutcome outcome;
  }

  struct GroupDetail {
    string name;
    uint256 groupId;
    Structs.VotingType votingType;
    address[] memberList;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor(string memory _name, uint256 _groupIndex, address createdBy) initializer {
    __Pausable_init();
    __AccessControl_init();
    
    name = _name;
    owner = createdBy;
    votingType = Structs.VotingType.OWNER;
    groupIndex = _groupIndex;
    memberList = [owner];
    creatingContract = msg.sender;
    groupFactory = GroupFactory(creatingContract);
    allocation[owner] = allocationTotal;

    require(createdBy != address(0), "createdBy required");

    _grantRole(DEFAULT_ADMIN_ROLE, createdBy);
    _grantRole(ADMIN_ROLE, createdBy);
    _grantRole(OWNER_ROLE, createdBy);
  }

  // Initialize Contract
  function initialize(address createdBy) initializer external {
    //require(msg.sender == RECEPTION_ACCOUNT, "Wrong Account Deployer");
    __Pausable_init();
    __AccessControl_init();
    _grantRole(DEFAULT_ADMIN_ROLE, createdBy);
    _grantRole(ADMIN_ROLE, createdBy);
    _grantRole(OWNER_ROLE, createdBy);
  }

  // Retrieve group details
  function getGroupDetails() view external returns(GroupDetail memory) {
    GroupDetail memory gd;
    gd.groupId = groupIndex;
    gd.name = name;
    gd.votingType = votingType;
    gd.memberList = memberList;

    return gd;
  }

  // Create Proposal
  function createProposal(Structs.ActionType requestType, address[] calldata _memberList, uint256[] calldata _allocation) external{
    require(isMember(msg.sender), 'Proposals can only be created by members');
    require(_memberList.length == _allocation.length, "Members should align with the allocation");

    GroupVote storage v = voteList[votingIndex.current()];
    v.voteIndex = votingIndex.current();
    votingIndex.increment();
    v.requestType = requestType;
    v.memberList = _memberList;
    v.votingType = votingType;
    v.votingMemberList = memberList;
    
    uint256 _allocationTotal = 0;
    emit GroupVoteInitiate(msg.sender, v.voteIndex);
    for (uint i=0; i<_memberList.length; i++) {
      v.allocation[_memberList[i]] = _allocation[i];
      _allocationTotal += _allocation[i];
      if (votingType == Structs.VotingType.OWNER && msg.sender == owner) {
        allocation[_memberList[i]] = _allocation[i];
      }
    }
    require(_allocationTotal == allocationTotal, 'Allocation must add to 100%');
    if (votingType == Structs.VotingType.OWNER && msg.sender == owner) {
      v.outcome = Structs.VoteOutcome.APPROVE;
      v.votes[msg.sender] = Structs.VoteOutcome.APPROVE;
      memberList = _memberList;
      votingType = v.votingType;
      groupFactory.updateGroupMembership(groupIndex, memberList);
      emit GroupVoteCompleted(v.voteIndex);
    }
    
  }

  // Cast Vote
  function castVote(uint256 voteIndex, bool decision) external {
    require(isMember(msg.sender), 'Must be a member to cast vote');
    require(voteIndex < votingIndex.current(), 'Proposal does not exist');

    GroupVote storage v = voteList[voteIndex];
    require(v.votes[msg.sender] == Structs.VoteOutcome.PENDING, 'Sender has already cast vote');
    require(v.outcome == Structs.VoteOutcome.PENDING, 'Proposal has already closed');
    if(decision) {
      v.votes[msg.sender] = Structs.VoteOutcome.APPROVE;
    } else {      
      v.votes[msg.sender] = Structs.VoteOutcome.REJECT;
    }

    Structs.VoteOutcome outcome = votingComplete(v);
    if (outcome == Structs.VoteOutcome.APPROVE) {      
      v.outcome = Structs.VoteOutcome.APPROVE;
      for (uint i=0; i<v.memberList.length; i++) {
        allocation[v.memberList[i]] = v.allocation[v.memberList[i]];
      }
      memberList = v.memberList;
      votingType = v.votingType;
      groupFactory.updateGroupMembership(groupIndex, memberList);
      emit GroupVoteCompleted(v.voteIndex);
    } else if (outcome == Structs.VoteOutcome.REJECT) {
      v.outcome = Structs.VoteOutcome.REJECT;
      emit GroupVoteCompleted(v.voteIndex);
    }
    
  }

  // Is voting complete
  function votingComplete(GroupVote storage v) internal view returns(Structs.VoteOutcome) {
    if (votingType == Structs.VotingType.OWNER && msg.sender == owner && v.votes[msg.sender] == Structs.VoteOutcome.APPROVE) {
      return Structs.VoteOutcome.APPROVE;
    } else if (votingType == Structs.VotingType.OWNER && msg.sender == owner && v.votes[msg.sender] == Structs.VoteOutcome.REJECT) {
      return Structs.VoteOutcome.REJECT;
    } else if (votingType == Structs.VotingType.ALL || votingType == Structs.VotingType.MAJORITY) {
      uint256 yeaVotes = 0;
      uint256 nayVotes = 0;
      uint256 nonVotes = 0;
      uint256 majorityThreshold = (memberList.length > 1) ? (memberList.length/2 + (memberList.length%2 >= 5 ? 1 : 0)) : 1;
      for (uint i=0; i<memberList.length; i++) {
        if (v.votes[memberList[i]] == Structs.VoteOutcome.APPROVE) {
          yeaVotes++;
        } else if (v.votes[memberList[i]] == Structs.VoteOutcome.REJECT) {
          nayVotes++;
        } else {
          nonVotes++;
        }
      }
      if (votingType == Structs.VotingType.ALL && (yeaVotes + nayVotes) < memberList.length) {
        return Structs.VoteOutcome.PENDING;
      } else if (votingType == Structs.VotingType.ALL && yeaVotes == memberList.length) {
        return Structs.VoteOutcome.APPROVE;
      } else if (votingType == Structs.VotingType.ALL && nayVotes > 0) {
        return Structs.VoteOutcome.REJECT;
      } else if (votingType == Structs.VotingType.MAJORITY && (yeaVotes < majorityThreshold) && (nayVotes < majorityThreshold)) {
        return Structs.VoteOutcome.PENDING;
      } else if (votingType == Structs.VotingType.MAJORITY && yeaVotes >= majorityThreshold) {
        return Structs.VoteOutcome.APPROVE;
      } else if (votingType == Structs.VotingType.MAJORITY && nayVotes >= majorityThreshold) {
        return Structs.VoteOutcome.REJECT;
      } else {
        return Structs.VoteOutcome.PENDING;
      }
    } else {
      return Structs.VoteOutcome.PENDING;
    }
  }

  // Change Voting Type
  function changeVoting(Structs.VotingType voteType) external {
    require(msg.sender == owner, 'Only the owner can change the voting type');
    if (votingType == Structs.VotingType.OWNER) {
      votingType = voteType;
    } else {
      GroupVote storage v = voteList[votingIndex.current()];
      v.voteIndex = votingIndex.current();
      votingIndex.increment();
      v.requestType = Structs.ActionType.MODIFY;
      v.votingType = voteType;
      v.memberList = memberList;
      for (uint i=0; i<memberList.length; i++) {
        v.allocation[memberList[i]] = allocation[memberList[i]];
      }
      
      emit GroupVoteInitiate(msg.sender, v.voteIndex);
    }

    
  }

  // Is a Member?
  function isMember(address to) public view returns(bool) {
    if (owner == to) {
      return true;
    } else if (allocation[to] > 0) {
      return true;
    }
    return false;
  }
  // Update Name
  function updateName(string calldata _name) external {
    require(msg.sender == owner, 'Only the group owner can change the name');
    name = _name;
  }

  // Transfer primary ownership
  function transferOwnership(address to) external onlyRole(ADMIN_ROLE) {
    require(to != address(0), 'to address required');
    _grantRole(OWNER_ROLE, to);
    owner = to;
  }

  // Get User Balance
  function getBalance() view external returns(uint256){
    return memberBalance[msg.sender];
  }

  // Get user allocation
  function getAllocation(address memberId) view external returns(uint256) {
    return allocation[memberId];
  }

  // Get vote index counter
  function getVoteIndex() view external returns(uint256) {
    return votingIndex.current();
  }

  // Get vote new member list
  function getVoteMemberList(uint256 _voteIndex) view external returns(address[] memory) {
    return voteList[_voteIndex].memberList;
  }

  // Get voting member list
  function getVotingMemberList(uint256 _voteIndex) view external returns(address[] memory) {
    return voteList[_voteIndex].votingMemberList;
  }

  // Get vote member allocation
  function getVoteMemberAllocation(uint256 _voteIndex, address memberId) view external returns(uint256) {
    return voteList[_voteIndex].allocation[memberId];
  }

  // Get vote member outcome
  function getVoteMemberOutcome(uint256 _voteIndex, address memberId) view external returns(Structs.VoteOutcome) {
    return voteList[_voteIndex].votes[memberId];
  }

  // Withdraw Member Funds
  function withdrawBalance() external {
    address payable payableReturn = payable(msg.sender);
    // send all Ether to owner
    // Owner can receive Ether since the address of owner is payable
    uint256 currentBalance = memberBalance[msg.sender];
    require(currentBalance > 0, 'Current member balance required to withdraw');
    memberBalance[msg.sender] = 0;
    payableReturn.transfer(currentBalance);
  }

  // Deposit function
  receive() external payable  {
    for (uint i=0; i<memberList.length; i++) {
      memberBalance[memberList[i]] = ((allocation[memberList[i]]*msg.value) / allocationTotal) + memberBalance[memberList[i]];
    }
  }

  // DEFAULT METHODS REQUIRED BY INTERFACES
  function pause() external onlyRole(OWNER_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(OWNER_ROLE) {
      _unpause();
  }  
}