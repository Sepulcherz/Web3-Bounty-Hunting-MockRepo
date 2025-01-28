import init, { BountyInterface } from '../pkg/bounty_project.js';

async function run() {
    await init();
    const bounty = new BountyInterface("0x0000");
    await bounty.connect();
    console.log("Connected!");
}

run().catch(console.error);
