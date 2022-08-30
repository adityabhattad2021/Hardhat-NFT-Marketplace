require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
	solidity: "0.8.9",
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 1337,
			blockConfirmations: 1,
		},
		localhost: {
			chainId: 1337,
			blockConfirmations: 1,
		},
		rinkeby: {
			chainId: 4,
			blockConfirmations: 6,
			url: RINKEBY_RPC_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	gasReporter: {
		enabled: false,
		currency: "INR",
		outputFile: "gas-reporter.txt",
		noColors: true,
		// coinmarketcap:COINMARKETCAP_API_KEY,
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		user1: {
			default: 1,
		},
	},
	mocha: {
		timeout: 500000, //500 seconds.
	},
};
