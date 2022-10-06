/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require("hardhat");
const ethers = require('ethers');
require("dotenv").config();

const deployContracts = async () => {
  
  const accounts = await hre.ethers.getSigners();
  const executor = await accounts[0].getAddress();

  // Deploy token
  const groupFactory = await hre.ethers.getContractFactory('GroupFactory');
  const contract = await groupFactory.deploy(executor);
  await contract.deployed();

  return [contract];
}

const main = async () => {
  try {
    let [contract] = await deployContracts();
    console.log('groupFactory address : ', contract.address);
    //console.log('multicall address : ', multicallContract.address);
    
    //await sendMoney();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const changePricing = async (contract, price) => {
  const accounts = await hre.ethers.getSigners();
  const executor = await accounts[0].getAddress();
  const worksManager = await hre.ethers.getContractAt('GroupFactory', contract);
  const result = await worksManager.setCost(hre.ethers.utils.parseEther(price));
  await result.wait();
  console.log(result);
}

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

main();
