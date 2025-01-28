# Task Bounty DApp

A decentralized application for managing bounties and tasks using WebAssembly, Rust, and Ethereum smart contracts.

## Overview

This project is a task bounty platform where:
- Users can connect to repositories and see the issues in "available tasks"
- Hunters can propose solutions via GitHub PRs
- Validators can review and approve solutions (not implemented)
- Rewards are managed through smart contracts (not implemented)

I created it along with the companion repository ["decentra-chat"](https://github.com/Sepulcherz/decentra-chat) to test Web3 interactions.

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
git clone https://github.com/Sepulcherz/bounty-project.git
cd bounty-project
```

2. Clean any existing builds (if encountering issues):
```bash
rm -rf pkg/
rm -rf node_modules/
rm package-lock.json
```

3. Install dependencies:
```bash
npm install
```

4. Build the WebAssembly module:
```bash
wasm-pack build --target web
```

5. Start the development server:
```bash
npm run dev
```

6. Be sure to create/use a token in static/js/main.js :
```
const githubToken = 'YOUR_TOKEN_HERE'
```

## Smart Contract

The project uses a smart contract deployed on Sepolia testnet at: `0xDE4eADf86cdC4B4E952439c24FbeD634728C6428`

### Contract Features
- Task creation with rewards (not implemented)
- Proposal submission
- Multi-validator approval system (not implemented)
- Automated reward distribution (not implemented)

## Usage

1. Connect your MetaMask wallet (do this first to see the "submit solution" button)
2. Connect to a GitHub repository
3. Browse available tasks
4. Submit solutions through GitHub PRs
5. Wait for validator approval (not implemented)

## Project Structure
```
/
├── src/
│   ├── lib.rs         # Rust/WASM core logic
│   └── index.js       # JavaScript entry point
├── pkg/               # WebAssembly output (generated)
└── contracts/         # Smart contract code
```

## Troubleshooting

If you encounter issues:
1. Make sure all prerequisites are installed
2. Try cleaning and rebuilding:
   ```bash
   rm -rf pkg/
   rm -rf node_modules/
   rm package-lock.json
   npm install
   wasm-pack build --target web
   ```
3. Check the browser console for errors
4. Ensure your MetaMask is connected to Sepolia testnet

## Contributing

Feel free to open issues or submit PRs!

## License

HAPPY TESTING!
