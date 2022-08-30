const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const args = [];
	console.log("-----------------------------------------------------");
	console.log("Trying to deploy NFTMarketPlace contract...");
	const nftMarketPlace = await deploy("NFTMarketplace", {
		from: deployer,
		log: true,
		args: args,
		waitConfirmations: network.config.blockConfirmations || 1,
	});
    console.log("Successfully deployed!");
    console.log("-----------------------------------------------------");

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		console.log("-----------------------------------------------------");
		await verify(nftMarketPlace.address, args);
		console.log("-----------------------------------------------------");
	}
	
};

module.exports.tags = ["all", "nftmarketplace"];


// TODO
// - Copy basicNFT.sol from previous project 
// - Write a deploy script for it 
// - Write all tests for nftMarketPlace.sol
// - Only then follow along the video

