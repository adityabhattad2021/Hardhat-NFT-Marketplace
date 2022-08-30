const { ethers, network } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");

const TOKEN_ID = 3;

const cancelItem = async () => {
	const nftMarketPlace = await ethers.getContract("NFTMarketplace");
	const basicNFT = await ethers.getContract("BasicNFT");
	console.log("-----------------------------------------------------------");
	console.log(`Trying to cancel the listing of item with token id ${TOKEN_ID}`);
	const transectionResponse = await nftMarketPlace.cancelListing(basicNFT.address, TOKEN_ID);
    const transectionResult = await transectionResponse.wait(1);
    console.log(`Successfully cancelled the listing of the item with token id ${TOKEN_ID}`);
	console.log("-----------------------------------------------------------");
	if (network.config.chainId == 1337) {
		console.log("-----------------------------------------------------------");
		console.log("Moving one block for transection to get confirmed.");
		await moveBlocks(1, (sleepAmount = 1000));
		console.log("-----------------------------------------------------------");
	}
};


cancelItem()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
