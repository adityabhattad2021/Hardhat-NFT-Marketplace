const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const args = [];
	if (developmentChains.includes(network.name)) {
		console.log("-----------------------------------------------------");
		console.log("Local Network Detected, deploying mocks...");
		await deploy("BasicNFT", {
			from: deployer,
			args: args,
			log: true,
			waitConfirmations: network.config.blockConfirmations || 1,
        });
        console.log("Deployed Mocks successfully!");
		console.log("-----------------------------------------------------");
	}
};


module.exports.tags=["all","test"]