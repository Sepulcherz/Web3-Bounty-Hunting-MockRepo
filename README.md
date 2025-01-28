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

3. Initialize npm project if package.json doesn't exist:
```bash
npm init -y
```

4. Update package.json scripts:
```json
{
  "scripts": {
    "dev": "webpack serve --open",
    "build": "webpack --mode production"
  }
}
```

5. Create webpack.config.js in the root directory:
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

6. Create src/index.js:
```javascript
import { BountyInterface, start } from '../pkg/bounty_project.js';

async function main() {
    try {
        start();
        const bounty = new BountyInterface("0x0000");
        await bounty.connect();
        console.log("Connected successfully!");
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
```

7. Create index.html in the root directory:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bounty Project</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

8. Install dependencies:
```bash
npm install webpack webpack-cli webpack-dev-server html-webpack-plugin --save-dev
```

9. Build the WebAssembly module:
```bash
wasm-pack build --target web
```

10. Start the development server:
```bash
npm run dev
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
├── index.html         # Main HTML file
├── webpack.config.js  # Webpack configuration
└── contracts/         # Smart contract code
```

## Troubleshooting

If you encounter issues:

1. "Cannot find module" or similar webpack errors:
   - Make sure all files exist in the correct locations
   - Check that src/index.js and webpack.config.js are set up correctly

2. If you see "'webpack' is not recognized":
   ```bash
   npm install webpack webpack-cli webpack-dev-server html-webpack-plugin --save-dev
   ```

3. For any other issues, try cleaning and rebuilding:
   ```bash
   rm -rf pkg/
   rm -rf node_modules/
   rm package-lock.json
   npm install
   wasm-pack build --target web
   ```

4. Check the browser console for errors

5. Ensure your MetaMask is connected to Sepolia testnet

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
