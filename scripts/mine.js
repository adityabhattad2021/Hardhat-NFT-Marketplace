const { moveBlocks } = require("../utils/move-blocks");

const BLOCKS = 2;
const SLEEP_AMOUNT = 1000;

async function mine() {
    console.log("-----------------------------------------------------------");
    console.log(`Mining ${BLOCKS} Blocks.`);
    await moveBlocks(BLOCKS, (sleepAmount = SLEEP_AMOUNT));
    console.log("-----------------------------------------------------------");
}

mine()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
