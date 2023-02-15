require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/vCWIqjWSDowwHthZFYp3SMi4xqX_Y_XV',
      accounts: [
        '386872354fab97c357b7c6e83c5db5f8aad1d275f6e2820d3a65d15570a46b11',
      ],
    },
  },
};
