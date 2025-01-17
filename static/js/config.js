export const CONFIG = {
    // GitHub Integration
    GITHUB: {
        API_BASE_URL: 'https://api.github.com',
        TOKEN_KEY: 'gh_bounty_token',
        RATE_LIMIT: {
            MAX_REQUESTS: 50,
            WINDOW_MS: 60000 // 1 minute
        }
    },
    
    // Blockchain Configuration
    BLOCKCHAIN: {
        NETWORKS: {
            SEPOLIA: {
                CHAIN_ID: 11155111,
                CONTRACT_ADDRESS: "0xDE4eADf86cdC4B4E952439c24FbeD634728C6428"
            }
        }
    },
    
    // Contribution Settings
    CONTRIBUTION: {
        DIFFICULTY_LEVELS: [
            { value: 1, label: '⭐ Beginner' },
            { value: 2, label: '⭐⭐ Intermediate' },
            { value: 3, label: '⭐⭐⭐ Advanced' },
            { value: 4, label: '⭐⭐⭐⭐ Expert' },
            { value: 5, label: '⭐⭐⭐⭐⭐ Master' }
        ],
        SKILLS: [
            'Rust', 
            'Solidity', 
            'JavaScript', 
            'React', 
            'Web3',
            'TypeScript',
            'Python',
            'Smart Contracts'
        ]
    },
    
    // Validation Rules
    VALIDATION: {
        GITHUB_REPO_REGEX: /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/,
        PR_URL_REGEX: /^https:\/\/github\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\/pull\/\d+$/
    }
};

// Utility functions for configuration and validation
export class ConfigManager {
    /**
     * Validate GitHub repository URL
     * @param {string} repoUrl - Repository URL to validate
     * @returns {boolean} - Whether the URL is valid
     */
    static validateRepoUrl(repoUrl) {
        return this.isValidRepoFormat(repoUrl);
    }

    /**
     * Validate Pull Request URL
     * @param {string} prUrl - Pull Request URL to validate
     * @returns {boolean} - Whether the URL is valid
     */
    static validatePRUrl(prUrl) {
        return CONFIG.VALIDATION.PR_URL_REGEX.test(prUrl);
    }

    /**
     * Check if repository URL is in the correct format
     * @param {string} repoUrl - Repository URL to check
     * @returns {boolean} - Whether the URL format is correct
     */
    static isValidRepoFormat(repoUrl) {
        // Strip out GitHub URL if present
        const cleanUrl = repoUrl.replace(/^https:\/\/github\.com\//, '');
        return CONFIG.VALIDATION.GITHUB_REPO_REGEX.test(cleanUrl);
    }

    /**
     * Safely get an environment variable
     * @param {string} key - Environment variable key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} - Environment variable value
     */
    static getEnv(key, defaultValue = null) {
        return import.meta.env?.[key] ?? defaultValue;
    }

    /**
     * Generate a secure, random token
     * @param {number} length - Length of the token
     * @returns {string} - Generated token
     */
    static generateSecureToken(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from(crypto.getRandomValues(new Uint32Array(length)))
            .map((x) => charset[x % charset.length])
            .join('');
    }
}

export default CONFIG;