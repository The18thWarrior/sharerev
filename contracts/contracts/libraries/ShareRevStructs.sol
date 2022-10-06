// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library Structs {
  enum VotingType { OWNER, MAJORITY, ALL }

  enum ActionType { ADD, REMOVE, MODIFY }

  enum VoteOutcome { PENDING, APPROVE, REJECT }

  function divider(uint numerator, uint denominator, uint precision) public pure returns(uint) {
    return (numerator*(uint(10)**uint(precision+1))/denominator + 5)/uint(10);
  }

  function commissionYield(uint total, uint percentage) public pure returns(uint) {
    return divider(total * percentage, 100, 4);
  }
}