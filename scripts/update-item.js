const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 1;
const UPDATED_PRICE = ethers.utils.parseEther("50");

const updateItem = async () => {
    const nftMarketPlace = await ethers.getContract("NFTMarketplace")
    const basicNFT = await ethers.getContract("BasicNFT")
    console.log("-----------------------------------------------------------");
    console.log(`Trying to update the price of the listed NFT with token id ${TOKEN_ID}`);
    const transectionResponse = await nftMarketPlace.updateListing(basicNFT.address, TOKEN_ID, UPDATED_PRICE);
    const transectionRecipt = await transectionResponse.wait(1)
    console.log(`Successfully updated the price of the item listed with token id ${TOKEN_ID} to ${UPDATED_PRICE}ETH`);
    console.log("-----------------------------------------------------------");
    if (network.config.chainId == 1337) {
        ("-----------------------------------------------------------");
        console.log("Moving one block for transectiob to get confirmed");
        await moveBlocks(1, (sleepAmount = 1000));
        console.log("-----------------------------------------------------------");
    }


};

updateItem()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
