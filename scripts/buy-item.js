const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 2;

const buyItem = async () => {
	const nftMarketPlace = await ethers.getContract("NFTMarketplace");
	const basicNFT = await ethers.getContract("BasicNFT");
	console.log("-----------------------------------------------------------");
	console.log(`Trying to buy the listed with token id ${TOKEN_ID}`);
	const transectionResponse = await nftMarketPlace.buyItem(basicNFT.address, TOKEN_ID,{value:ethers.utils.parseEther("10")});
    const transectionRecipt = await transectionResponse.wait(1);
    console.log(`Successfully bought the item listed with token id ${TOKEN_ID}`);
    console.log("-----------------------------------------------------------");
    if (network.config.chainId == 1337) {
        console.log("-----------------------------------------------------------");
        console.log("Moving one block for transectiob to get confirmed");
        await moveBlocks(1, (sleepAmount = 1000));
        console.log("-----------------------------------------------------------");

    }


};

buyItem()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
