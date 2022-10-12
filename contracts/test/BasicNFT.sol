// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
	// Storage Variables
	string public constant TOKEN_URI =
		"ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

	uint256 private s_tokenCounter;

	// Counstructor
	constructor() ERC721("CUTEDOG", "CDOG") {
		s_tokenCounter = 0;
	}

	function mintNFT() public {
		s_tokenCounter += 1;
		_safeMint(msg.sender, s_tokenCounter);
	}

	function tokenURI(
		uint256  tokenId 
	) public view override returns (string memory) {
		return TOKEN_URI;
	}

	function getTokenCounter() public view returns (uint256) {
		return s_tokenCounter;
	}
}
