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
git clone https://github.com/Sepulcherz/Web3-Bounty-Hunting-MockRepo.git
cd Web3-Bounty-Hunting-MockRepo
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

## Project Files

### package.json
```json
{
  "name": "bounty-project",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "webpack serve --open"
  },
  "devDependencies": {
    "copy-webpack-plugin": "^12.0.2",
    "html-webpack-plugin": "^5.6.3",
    "webpack": "^5.97.1",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.15.2"
  }
}
```

### webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    experiments: {
        asyncWebAssembly: true
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '.')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        })
    ]
};
```

### src/index.js
```javascript
import init, { BountyInterface } from '../pkg/bounty_project.js';

async function run() {
    await init();
    const bounty = new BountyInterface("0x0000");
    await bounty.connect();
    console.log("Connected!");
}

run().catch(console.error);
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
├── webpack.config.js  # Webpack configuration
└── package.json      # Project configuration
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

This project is open source and available under the MIT License.

HAPPY TESTING!

(And here's some screenshots below!)

Connect your wallet first (important)

![localhost_8080_ (4)](https://github.com/user-attachments/assets/7eb19e98-c582-4a96-aa31-05a3237619b1)


![localhost_8080_ (5)](https://github.com/user-attachments/assets/58410edd-4bf2-48f9-8b52-c0f358bbf21d)

Paste your repo (my "decentra-chat" would not work for yourself, since I accessed it with my own token)

![localhost_8080_ (6)](https://github.com/user-attachments/assets/a40dd8ea-f9f2-47a3-a4f7-382e5aa267bc)

Fork or branch

![Capture d'écran 2025-01-28 090415](https://github.com/user-attachments/assets/3a12cc6c-3e2b-4802-8067-ef3892bcd07c)

Submit your PR

![Capture d'écran 2025-01-28 090433](https://github.com/user-attachments/assets/87808eb3-faa5-4c25-9c3e-1569e2cd9415)

And voilà! You can observe your PR being created and click on "View PR" to get redirected to it!

![Capture d'écran 2025-01-28 090447](https://github.com/user-attachments/assets/55cded30-f354-436f-a9d5-0b96d838fbfb)

Lil' exemple after creating your PR

![github com_Sepulcherz_decentra-chat_pull_90](https://github.com/user-attachments/assets/1a7db82c-03b0-4f87-84fe-481c14a288f7)
