
import {BigNumber} from '@ethersproject/bignumber';
import {ethers} from 'ethers';

import groupFactoryAbi from '../contracts/GroupFactory.json';
import groupAbi from '../contracts/Group.json'

import { env } from './constants';

const { ethereum } = window;
//const GROUP_COST = ".002"; 

export const createGroup = async function(name, store) {
  const chainId = BigNumber.from(ethereum.chainId).toNumber();
  const groupFactoryAddress = (chainId ===  Number(env.REACT_APP_CHAIN_ID)) ? env.REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL : env.REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI;
  
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    groupFactoryAddress,
    groupFactoryAbi.abi,
    signer
  );
  const options = {value: ethers.utils.parseEther("0")}
  let nftTx = await contract.createGroupContract(name, options);
  //console.log('nftTx',nftTx);
  let storeTxns = store.getState('transactions');
  const newTxnList = [...storeTxns.value, nftTx];
  store.onStoreUpdate('transactions', newTxnList);
  return 'success'; 
}

export const getGroupContractCount = async function() {
  const chainId = BigNumber.from(ethereum.chainId).toNumber();
  console.log(chainId);
  const groupFactoryAddress = (chainId ===  Number(env.REACT_APP_CHAIN_ID)) ? env.REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL : env.REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI;

  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    groupFactoryAddress,
    groupFactoryAbi.abi,
    signer
  );

  const txn = await contract.getGroupContractCount();
  //console.log(txn);
  return txn;
}

export const getGroupContract = async function(groupId) {
  const chainId = BigNumber.from(ethereum.chainId).toNumber();
  const groupFactoryAddress = (chainId ===  Number(env.REACT_APP_CHAIN_ID)) ? env.REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL : env.REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI;

  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    groupFactoryAddress,
    groupFactoryAbi.abi,
    signer
  );

  const txn = await contract.getGroupContract(groupId);
  //console.log(txn);
  return txn;
}

export const getGroupDetails = async function(groupAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    groupAddress,
    groupAbi.abi,
    signer
  );

  const txn = await contract.getGroupDetails();
  return txn;
}

export const getGroupAllocation = async function(groupAddress, memberAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    groupAddress,
    groupAbi.abi,
    signer
  );

  const txn = await contract.getAllocation(memberAddress);
  return txn;
}

export const createProposal = async function(requestType, memberList, allocation, groupAddress, store) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );
  //console.log(ethers.utils.getAddress(groupAddress));
  const txn = await contract.createProposal(requestType, memberList, allocation);  
  let storeTxns = store.getState('transactions');
  const newTxnList = [...storeTxns.value, txn];
  store.onStoreUpdate('transactions', newTxnList);
  return txn;
}

export const getGroupVotingIndex = async function(groupAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getVoteIndex();
  return txn;
}

export const getVoteDetails = async function(groupAddress, voteIndex) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.voteList(BigNumber.from(voteIndex));
  return txn;
  
}

export const getVotingMemberList = async function(groupAddress, voteIndex) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getVotingMemberList(BigNumber.from(voteIndex));
  return txn;
}

export const getVoteMemberList = async function(groupAddress, voteIndex) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getVoteMemberList(BigNumber.from(voteIndex));
  return txn;
}

export const getVoteMemberAllocation = async function(groupAddress, voteIndex, memberId) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getVoteMemberAllocation(BigNumber.from(voteIndex), ethers.utils.getAddress(memberId));
  return txn;
}

export const getVoteMemberOutcome = async function(groupAddress, voteIndex, memberId) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getVoteMemberOutcome(BigNumber.from(voteIndex), ethers.utils.getAddress(memberId));
  return txn;
}

export const createChangeVoteProposal = async function(voteType, groupAddress, store) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );
  //console.log(ethers.utils.getAddress(groupAddress));
  const txn = await contract.changeVoting(voteType);  
  let storeTxns = store.getState('transactions');
  const newTxnList = [...storeTxns.value, txn];
  store.onStoreUpdate('transactions', newTxnList);
  return txn;
}

export const castVote = async function(groupAddress, voteIndex, decision, store) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.castVote(BigNumber.from(voteIndex),decision);
  let storeTxns = store.getState('transactions');
  const newTxnList = [...storeTxns.value, txn];
  store.onStoreUpdate('transactions', newTxnList);
  return txn;
}

export const getMemberBalance = async function(groupAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.getBalance();
  return txn;
}

export const withdrawBalance = async function(groupAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    ethers.utils.getAddress(groupAddress),
    groupAbi.abi,
    signer
  );

  const txn = await contract.withdrawBalance();
  return txn;
}