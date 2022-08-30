const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");


const mintAndList = async () => {
    const nftMarketPlace = await ethers.getContract("NFTMarketplace")
    const basicNFT = await ethers.getContract("BasicNFT")
    console.log("-----------------------------------------------------------");
    console.log("Trying to mint basic NFT...");
    const transectionResponse = await basicNFT.mintNFT()
    const transectionResult = await transectionResponse.wait(1)
    const tokenId = transectionResult.events[0].args.tokenId;
    console.log("-----------------------------------------------------------");
    console.log("Trying to approve the Market place for handling the NFT");
    const tx = await basicNFT.approve(nftMarketPlace.address, tokenId);
    await tx.wait(1);
    console.log("-----------------------------------------------------------");
    console.log("Trying to list NFT to the market place");
    const listTransection = await nftMarketPlace.listItem(basicNFT.address, tokenId, ethers.utils.parseEther("10"))
    await listTransection.wait(1);
    console.log("Minted and listed NFT successfully.");
    console.log("-----------------------------------------------------------");
    if (network.config.chainId == 1337) {
        console.log("-----------------------------------------------------------");
        console.log("Moving one block for transection to get confirmed.");
        await moveBlocks(1, (sleepAmount = 1000));
        console.log("-----------------------------------------------------------");
    }
};


mintAndList()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
