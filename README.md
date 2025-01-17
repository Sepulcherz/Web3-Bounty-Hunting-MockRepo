# Task Bounty DApp

A decentralized application for managing bounties and tasks using WebAssembly, Rust, and Ethereum smart contracts.

## Overview

This project is a task bounty platform where:
- Users can connect to repositories and see the issues in "avalaible task" if there are some 
- Hunters can propose solutions via GitHub PRs
- Validators can review and approve solutions (not implemented)
- Rewards are managed through smart contracts (not implemented)

I created it (and also created the "https://github.com/Sepulcherz/decentra-chat" repo, which go hand in hand to test some interactions) for a personal purpose, just to see if I had grasped the concept of interactions in a web3 environment.

Nothing too serious, but if it's useful to you, feel free to use it!

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- [git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) browser extension
- A GitHub account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Web3-Bounty-Hunting-MockRepo.git
cd Web3-Bounty-Hunting-MockRepo
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Build the WebAssembly module:
```bash
wasm-pack build
```

4. Create a .env file based on .env.example:
```bash
cp .env.example .env
```

5. Fill in your environment variables in .env:
```
PRIVATE_KEY=your_metamask_private_key_here
```

6. Fill in your github token in main.js
```
const githubToken = 'your_token_here'
```
## Development Setup

1. Make sure you have Sepolia testnet configured in MetaMask

2. Get some Sepolia ETH from a faucet:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Faucet](https://sepoliafaucet.com/)

3. Start the development server:
```bash
npm run dev
```

## Smart Contract

The project uses a smart contract deployed on Sepolia testnet at: `0xDE4eADf86cdC4B4E952439c24FbeD634728C6428`

### Contract Features
- Task creation with rewards (not implemented, you can create tasks, but you won't get any rewards for them, I could have make some "mock" rewards but I didn't do it, did some logic template in TaskBounty.sol, but they aren't used, like some lines of code in this repo, sorry, it's a bit messy)
- Proposal submission
- Multi-validator approval system (not implemented)
- Automated reward distribution (not implemented)

## Project Structure

```
/
├── src/                # Frontend source code
├── static/             # Static assets
├── pkg/               # WebAssembly output
├── scripts/           # Helper scripts
└── contracts/         # Smart contract code
```

## Usage

1. Connect your MetaMask wallet (Be sure to do that first before connecting to any repo, or you won't be able to see the "submit solution" button on the displayed cards, sorry, got lazy near the end)
2. Connect to a GitHub repository
3. Create or browse tasks
4. Submit solutions through GitHub PRs
5. Wait for validator approval (not implemented)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Acknowledgments

- Built with Rust and WebAssembly
- Smart contracts deployed on Ethereum Sepolia testnet
- GitHub integration for PR management
- MetaMask for wallet connectivity

HAPPY TESTING!
