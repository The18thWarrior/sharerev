export const env = {
  REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL: process.env.REACT_APP_GROUP_FACTORY_ADDRESS_LOCAL,
  REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI: process.env.REACT_APP_GROUP_FACTORY_ADDRESS_MUMBAI,
  REACT_APP_CHAIN_ID : process.env.REACT_APP_CHAIN_ID, 
  REACT_APP_CHAIN_RPC_URL : process.env.REACT_APP_CHAIN_RPC_URL,
  REACT_APP_CHAIN_RPC_URL_MUMBAI: process.env.REACT_APP_CHAIN_RPC_URL_MUMBAI,
  REACT_APP_MULTICALL_ADDRESS_LOCAL : process.env.REACT_APP_MULTICALL_ADDRESS_LOCAL,
  REACT_APP_MULTICALL_MUMBAI: process.env.REACT_APP_MULTICALL_MUMBAI,
  REACT_APP_LAMBDA_URL: process.env.REACT_APP_LAMBDA_URL,
}

export const votingTypes = ['Owner Controlled', 'Majority', 'All or Nothing'];
export const actionTypes = ['Add', 'Remove', 'Modify'];
export const voteOutcomes = ['Pending', 'Approved', 'Rejected'];
export const proposalTypes = ['Allocation', 'Voting Type Change'];