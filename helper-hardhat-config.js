const { ethers } = require("hardhat");

const networkConfig = {
	4: {
		name: "rinkeby",
		vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: 9344, 
        callBackGasLimit: "500000",
	},
	1337: {
		name: "hardhat",
        entranceFee: ethers.utils.parseEther("1"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackGasLimit: "500000",
	},
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
	networkConfig,
	developmentChains,
};
