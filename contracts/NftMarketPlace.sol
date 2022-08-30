// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// TODO:
// 1. `listItems`: List NFTs on the marketplace
// 2. `buyItems`: Buy the NFTs from the marketplace
// 3. `cancelItems`: Cancel a listing
// 4. `updateListing`: Update the price of the NFT already listed
// 5. `withdrawProceeds`: Withdraw payment for my bought NFTs

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


error NFTMarketplace__NotOwnerOfNFT();
error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__TokenNotApprovedForNFTMarketPlace();
error NFTMarketplace__TokenAlreadyListed(
    address nftAddress,
    uint256 tokenId,
    address owner
);
error NFTMarketplace__TokenNotListed(
    address nftAddress,
    uint256 tokenId
);
error NFTMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTMarketplace__NoProceeds();
error NFTMarketplace__ProceedsTransferFailed();


contract NFTMarketplace is ReentrancyGuard{

    // Events

    event NewItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );


    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );


    event ItemListingCancelled(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId
    );


    event ItemPriceUpdated(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );


	struct Listing {
		uint256 price;
		address seller;
	}

    // NFT Contract Address => NFT TokenId => Listing
	mapping(address => mapping(uint256 => Listing)) private s_listings;

    // Seller Address => Amount earned by the seller
    mapping(address => uint256) private s_proceeds;



    // Modifiers

    modifier checkNotAlreadyListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price>0){
            revert NFTMarketplace__TokenAlreadyListed(
                nftAddress,tokenId,owner
            );
        }
        _;
    }

    modifier checkIsOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(spender!=owner){
            revert NFTMarketplace__NotOwnerOfNFT();
        }
        _;
    }

    modifier confirmIsListed(
        address nftAddress,
        uint256 tokenId
    ) {
        Listing memory listing=s_listings[nftAddress][tokenId];
        if(listing.price<=0){
            revert NFTMarketplace__TokenNotListed(nftAddress,tokenId);
        }
        _;
    }






	// Main Fucntions


    /**
     * @notice Method for listing NFT on marketplace
     * @dev Technically, we could have contract to hold NFT
     * but the way we implemented this, people can still hold their NFTs when listed
     * @param tokenId: The tokenId of the NFT
     * @param nftAddress: The address of the NFT
     * @param price: sale price for the NFT
     */ 
	function listItem(
		address nftAddress,
		uint256 tokenId,
		uint256 price
	) 
      external 
      checkNotAlreadyListed(nftAddress,tokenId,msg.sender)
      checkIsOwner(nftAddress,tokenId,msg.sender) 
    {
		if (price <= 0) {
			revert NFTMarketplace__PriceMustBeAboveZero();
		}

		IERC721 nft = IERC721(nftAddress);

		if (nft.getApproved(tokenId) != address(this)) {
			revert NFTMarketplace__TokenNotApprovedForNFTMarketPlace();
		}

        s_listings[nftAddress][tokenId]=Listing(price,msg.sender);
        emit NewItemListed(msg.sender,nftAddress,tokenId,price);
	}



    /**
     * @notice Method for buying NFT from the marketplace
     * @dev This function lets the buyer buy the NFT from the marketplace and it is reentrancy safe
     * @param tokenId: The tokenId of the NFT
     * @param nftAddress: The address of the NFT
     */
    function buyItem(address nftAddress,uint256 tokenId)
        external
        payable
        confirmIsListed(nftAddress,tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value<listedItem.price){
            revert NFTMarketplace__PriceNotMet(nftAddress,tokenId,listedItem.price);
        }

        s_proceeds[listedItem.seller]=s_proceeds[listedItem.seller]+msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721 nft =IERC721(nftAddress);
        nft.safeTransferFrom(listedItem.seller,msg.sender,tokenId);

        emit ItemBought(msg.sender,nftAddress,tokenId,msg.value);
    }



    /**
     * @notice Method for cancelling a listing
     * @dev This function lets the seller cancel a listing.
     * @param tokenId: The tokenId of the NFT
     * @param nftAddress: The address of the NFT
     */
    function cancelListing(address nftAddress,uint256 tokenId)
        external
        checkIsOwner(nftAddress,tokenId,msg.sender)
        confirmIsListed(nftAddress,tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemListingCancelled(msg.sender,nftAddress,tokenId);
    }



    /**
     * @notice Method for updating the price of a listing
     * @dev This function lets the seller update the price of a listing.
     * @param tokenId: The tokenId of the NFT
     * @param nftAddress: The address of the NFT
     * @param newPrice: The new price for the NFT
     */
    function updateListing(address nftAddress,uint256 tokenId,uint256 newPrice)
        external
        checkIsOwner(nftAddress,tokenId,msg.sender)
        confirmIsListed(nftAddress,tokenId)
    {
        s_listings[nftAddress][tokenId].price=newPrice;
        emit ItemPriceUpdated(msg.sender,nftAddress,tokenId,newPrice);
    }  



    /**
     * @notice Method for getting the proceeds of a seller
     * @dev This function lets the seller withdraw his proceeds from the marketplace (gained from selling his NFTs).
     */
    function withDrawProceeds()
     external 
     nonReentrant
    {
        uint256 proceeds=s_proceeds[msg.sender];
        if(proceeds<=0){
            revert NFTMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender]=0;
        (bool success,)=payable(msg.sender).call{value:proceeds}("");
        if(!success){
            revert NFTMarketplace__ProceedsTransferFailed();
        }
    } 


    // Getter functions for internal variables


    
    function getListing(address nftAddress,uint256 tokenId) external view returns (Listing memory){
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256){
        return s_proceeds[seller];
    }
}


