const { assert, expect } = require("chai");
const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("NFT Market Place Unit tests", () => {
			let nftMarketPlace, deployer, user1, basicNFT;
			const chainId = network.config.chainId;
			const PRICE = ethers.utils.parseEther("0.1");
			const TOKEN_ID = "1";

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				// console.log(deployer);
				const accounts = await ethers.getSigners();
				user1 = accounts[4];
				await deployments.fixture(["all"]);
				nftMarketPlace = await ethers.getContract("NFTMarketplace", deployer);
				basicNFT = await ethers.getContract("BasicNFT", deployer);
				const transection = await basicNFT.mintNFT();
				await transection.wait(1);
			});

			describe("List Item", () => {
				it("Reverts if any one else other than owner tries to list the NFT", async () => {
					// basicNFT.approve(nftMarketPlace.address, "1")
					const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1);
					// console.log(`User 1 ${user1} basic NFT ${basicNFT}User 1 connected marketplace ${user1ConnectedMarketPlace}`);
					await expect(
						user1ConnectedMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE)
					).to.be.revertedWith("NFTMarketplace__NotOwnerOfNFT");
				});

				it("Allows owner to list the NFT", async () => {
					const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
					await tx.wait(1);
					expect(
						await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE)
					).to.emit("NewItemListed");
				});

				it("Reverts if already listed NFT is tried to get listed again", async () => {
					const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
					await tx.wait(1);
					expect(
						await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE)
					).to.emit("NewItemListed");
					const errorMsg = `NFTMarketplace__TokenAlreadyListed("${
						basicNFT.address
					}", ${TOKEN_ID}, "${await basicNFT.ownerOf(TOKEN_ID)}")`;
					await expect(
						nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE)
					).to.be.revertedWith(errorMsg);
				});

				it("Reverts if the NFT is not approved for the market place to list", async () => {
					await expect(
						nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE)
					).to.be.revertedWith("NFTMarketplace__TokenNotApprovedForNFTMarketPlace");
				});

				it("Reverts is price is set to zero or less than zero while listing", async () => {
					await expect(
						nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, "0")
					).to.be.revertedWith("NFTMarketplace__PriceMustBeAboveZero");
				});
			});

			describe("Buy Item", () => {
				it("Only allows to buy an item if it is listed", async () => {
					const errorMsg = `NFTMarketplace__TokenNotListed("${basicNFT.address}", ${TOKEN_ID})`;
					await expect(
						nftMarketPlace.buyItem(basicNFT.address, TOKEN_ID)
					).to.be.revertedWith(errorMsg);
				});

				it("Reverts if the ETH sent with the function is less then actual value of the NFT", async () => {
					const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
					await tx.wait(1);
					await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
					const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1);
					const errorMsg = `NFTMarketplace__PriceNotMet("${basicNFT.address}", ${TOKEN_ID}, ${PRICE})`;
					await expect(
						user1ConnectedMarketPlace.buyItem(basicNFT.address, TOKEN_ID, {
							value: (PRICE - ethers.utils.parseEther("0.001")).toString(),
						})
					).to.be.revertedWith(errorMsg);
				});

				it("If the transection is completed successfully emits an event, transfers the ownership of the NFT to the buyer and add the price of the NFT to the sellers account", async () => {
					const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
					await tx.wait(1);
					await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
					const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1);
					expect(
						await user1ConnectedMarketPlace.buyItem(basicNFT.address, TOKEN_ID, {
							value: PRICE,
						})
					).to.emit("ItemBought");
					// const buyer = buyTransectionResult.events[0].args.buyer
					const buyer = await basicNFT.ownerOf(TOKEN_ID);
					const proceedsAquired = await nftMarketPlace.getProceeds(deployer.toString());
					assert.equal(buyer, user1.address);
					assert.equal(proceedsAquired.toString(), PRICE.toString());
				});
			});

			describe("Update Listing", () => {
				beforeEach(async () => {
					const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
					await tx.wait(1);
					await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
				});
				it("Reverts if the caller is not the owner of NFT", async () => {
					const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1);
					await expect(
						user1ConnectedMarketPlace.updateListing(basicNFT.address, TOKEN_ID, "100")
					).to.be.revertedWith("NFTMarketplace__NotOwnerOfNFT");
				});
				it("Emits an event when listing is updated", async () => {
					expect(
						await nftMarketPlace.updateListing(
							basicNFT.address,
							TOKEN_ID,
							ethers.utils.parseEther("20")
						)
					).to.emit("ItemPriceUpdated");
				});
			});
		
		describe("Delete Listing", () => {

			beforeEach(async () => {
				const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
				await tx.wait(1);
				await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
			});

			it("Reverts if the caller is not the owner", async () => {
				const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1)
				expect(user1ConnectedMarketPlace.cancelListing(basicNFT.address,TOKEN_ID)).to.be.revertedWith("NFTMarketplace__NotOwnerOfNFT")
			})

			it("Emits an event when the NFT is delisted from the market place", async () => {
				expect(await nftMarketPlace.cancelListing(basicNFT.address,TOKEN_ID)).to.emit("ItemListingCancelled")
			})
		})
		
		describe("Withdraw proceeds", () => {
			beforeEach(async () => {
				const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
				await tx.wait(1);
				await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
			});
			it("Reverts if there are no proceeds", async () => {
				await expect( nftMarketPlace.withDrawProceeds()).to.be.revertedWith("NFTMarketplace__NoProceeds")
			})
			it("Allows Owner to withdraw proceeds and sets the proceeds to zero after the withdraw", async () => {
				const user1ConnectedMarketPlace = await nftMarketPlace.connect(user1);
				await user1ConnectedMarketPlace.buyItem(basicNFT.address, TOKEN_ID, {
					value: PRICE,
				})
				await nftMarketPlace.withDrawProceeds()
				assert.equal((await nftMarketPlace.getProceeds(deployer)).toString(),"0")
			})

		})

		describe("Get listing", () => {
			it("Returns the correct owner and price of the NFT", async () => {
				const tx = await basicNFT.approve(nftMarketPlace.address, TOKEN_ID);
				await tx.wait(1);
				await nftMarketPlace.listItem(basicNFT.address, TOKEN_ID, PRICE);
				const listedNFT =await nftMarketPlace.getListing(basicNFT.address, TOKEN_ID)
				
				// console.log(nftOwner["seller"]);
				assert.equal(listedNFT["seller"], deployer)
				assert.equal((listedNFT["price"]).toString(),PRICE)
			})
		})
	  });
