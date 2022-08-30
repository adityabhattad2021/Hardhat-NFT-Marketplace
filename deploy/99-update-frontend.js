const { ethers, network } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

const frontEndContractFile = "../nextjs-nft-marketplace/constants/networkMapping.json";
const frontendABILocation = "../nextjs-nft-marketplace/constants/";


module.exports = async function () {
	if (process.env.UPDATE_FRONT_END == "true") {
		console.log("-------------------------------------------------------------------");
		console.log("Updating the Frontend...");
		await updateABI();
		await updateContractAddresses();
	}
};


async function updateABI() {

	const nftMarketPlace = await ethers.getContract("NFTMarketplace")
	fs.writeFileSync(
		`${frontendABILocation}NFTMarketplace.json`,
		nftMarketPlace.interface.format(ethers.utils.FormatTypes.json)
	)

	const basicNFT = await ethers.getContract("BasicNFT")
	fs.writeFileSync(
		`${frontendABILocation}BasicNFT.json`,
		basicNFT.interface.format(ethers.utils.FormatTypes.json)
	)

}

async function updateContractAddresses() {
	const nftMarketPlace = await ethers.getContract("NFTMarketplace");
	const chainId = network.config.chainId.toString();
	const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractFile, "utf-8"));

	if (chainId in contractAddresses) {
		if (!contractAddresses[chainId]["NFTMarketplace"].includes(nftMarketPlace.address)) {
			contractAddresses[chainId]["NFTMarketplace"].push(nftMarketPlace.address);
		}
	} else {
		contractAddresses[chainId] = { NFTMarketplace: [nftMarketPlace.address] };
	}
	try {
		fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses));
		console.log("Updated Frontned Successfully.");
		console.log("-------------------------------------------------------------------");
	} catch (error) {
		console.log(error);
	}
}

module.exports.tags = ["all", "frontend"];
