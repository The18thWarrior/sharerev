### Deployment Steps
Start local node
npx hardhat node

Compile Contracts
npx hardhat compile

Deploy Contracts - Local
npx hardhat run --network localhost scripts/test.js

Deploy Contracts - Testnet
npx hardhat run --network mumbai scripts/deploy.js