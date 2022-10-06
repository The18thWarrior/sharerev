
import { env } from './constants';
import { makeId } from './utility';

export const formatString = function(format) {
  var args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number] 
      : match
    ;
  });
  
}

export const getMembershipList = async (walletAddress, chainId) => {
  const reqUrl = env.REACT_APP_LAMBDA_URL+'address?memberAddress='+walletAddress + '&chainId='+chainId;
  let metadataRequest = await fetch(reqUrl);
  const response = await metadataRequest.json();  
  let results = [];
  //console.log(response);
  for (let item of response.results) {
    item.key = makeId(8);
    results.push(item);
  }
  return results;
}

export const alchemyReadTransaction = async (transactionHash) => {
  const reqUrl = env.REACT_APP_LAMBDA_URL+'alchemy';
  await fetch(reqUrl, {
    method: 'post',
    body: transactionHash
  })
}