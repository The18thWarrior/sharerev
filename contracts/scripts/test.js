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
  
  const multicall = await hre.ethers.getContractFactory('Multicall');
  const multicallContract = await multicall.deploy();
  await multicallContract.deployed();

  return [contract, multicallContract];
}

const sendMoney = async () => {
  const accounts = await hre.ethers.getSigners();
  const gas_price = await hre.ethers.provider.getGasPrice();
  let account1 = accounts[0];

  console.log("Account balance:", (await account1.getBalance()).toString());
  

  let results = await account1.sendTransaction({
    to: process.env.TEST_ACCOUNT,
    value : hre.ethers.utils.parseEther('100'),
  });  
}

const main = async () => {
  try {
    await hre.network.provider.send("hardhat_reset");
    let [contract, multicallContract] = await deployContracts();
    console.log('groupFactory address : ', contract.address);
    console.log('multicall address : ', multicallContract.address);
    
    await sendMoney();
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
