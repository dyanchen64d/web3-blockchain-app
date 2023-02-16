require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/vCWIqjWSDowwHthZFYp3SMi4xqX_Y_XV',
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
    },
  },
};
