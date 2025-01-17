const GITHUB_API = 'https://api.github.com';

export class GitHubIntegration {
    constructor(token) {
        this.token = token;
        this.connectedRepo = null;
        this.currentUser = null;
        this.lastForkResult = null;
        this.lastBranchName = null;
        this.lastCreatedPRUrl = null;
    }

    get isConnected() {
        return !!this.connectedRepo;
    }

    async connect(repoUrl) {
        try {
            // Normalize repository URL
            const [owner, repo] = repoUrl.replace('https://github.com/', '').replace('.git', '').split('/');
            if (!owner || !repo) throw new Error('Invalid repository URL');

            // Get repository details
            const repoResponse = await this.request(`/repos/${owner}/${repo}`);
            if (!repoResponse.ok) throw new Error('Repository not found');

            // Get current user
            const userResponse = await this.request('/user');
            const user = await userResponse.json();
            this.currentUser = user.login;

            this.connectedRepo = { owner, repo };
            return this.connectedRepo;
        } catch (error) {
            console.error('Repository connection failed:', error);
            throw error;
        }
    }

    async getIssues() {
        if (!this.isConnected) throw new Error('No repository connected');
        const response = await this.request(`/repos/${this.connectedRepo.owner}/${this.connectedRepo.repo}/issues?state=open`);
        if (!response.ok) throw new Error('Failed to fetch issues');
        return response.json();
    }

    async forkAndCreateBranch(issueNumber) {
        if (!this.isConnected) throw new Error('No repository connected');
        
        const { owner, repo } = this.connectedRepo;
        
        // If current user is not the repo owner, fork
        if (this.currentUser !== owner) {
            try {
                const forkResponse = await this.request(
                    `/repos/${owner}/${repo}/forks`,
                    { method: 'POST' }
                );
                const forkData = await forkResponse.json();
                
                // Wait a bit for GitHub to process the fork
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                this.lastForkResult = {
                    targetOwner: forkData.owner.login,
                    targetRepo: forkData.name,
                    repoUrl: forkData.clone_url
                };
            } catch (forkError) {
                console.warn('Forking failed, trying to use existing fork', forkError);
                // Find existing fork
                const forksResponse = await this.request(`/users/${this.currentUser}/repos`);
                const existingFork = (await forksResponse.json()).find(
                    r => r.fork && r.parent.full_name === `${owner}/${repo}`
                );
                
                if (existingFork) {
                    this.lastForkResult = {
                        targetOwner: this.currentUser,
                        targetRepo: existingFork.name,
                        repoUrl: existingFork.clone_url
                    };
                } else {
                    throw new Error('Could not fork or find existing fork');
                }
            }
        } else {
            // If user is repo owner, use original repo details
            this.lastForkResult = {
                targetOwner: owner,
                targetRepo: repo,
                repoUrl: `https://github.com/${owner}/${repo}.git`
            };
        }

        // Create branch
        const { targetOwner, targetRepo } = this.lastForkResult;
        
        // Get default branch
        const branchResponse = await this.request(
            `/repos/${owner}/${repo}/branches/main`
        );
        const mainBranch = await branchResponse.json();
        
        // Prepare branch name
        const branchName = `fix/issue-${issueNumber}`;
        
        // Create branch
        await this.request(
            `/repos/${targetOwner}/${targetRepo}/git/refs`,
            {
                method: 'POST',
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: mainBranch.commit.sha
                })
            }
        );

        // Store branch name
        this.lastBranchName = branchName;

        return {
            repoUrl: `https://github.com/${targetOwner}/${targetRepo}`,
            branchName: branchName
        };
    }

    async createBranchAndPR(issueNumber) {
        if (!this.isConnected) throw new Error('No repository connected');
        
        try {
            const { owner, repo } = this.connectedRepo;
            
            // Ensure we have fork details
            if (!this.lastForkResult) {
                await this.forkAndCreateBranch(issueNumber);
            }
            
            const { targetOwner, targetRepo } = this.lastForkResult;
            
            // Get issue details
            const issueResponse = await this.request(
                `/repos/${owner}/${repo}/issues/${issueNumber}`
            );
            const issue = await issueResponse.json();

            // Prepare branch name (use the one we created earlier)
            const branchName = this.lastBranchName || `fix/issue-${issueNumber}`;
            
            // Create a minimal commit to ensure PR can be created
            const commitResponse = await this.request(
                `/repos/${targetOwner}/${targetRepo}/contents/ISSUE_${issueNumber}_PLACEHOLDER.md`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        message: `Initial commit for issue #${issueNumber}`,
                        content: btoa(`Placeholder commit for issue ${issueNumber}`),
                        branch: branchName
                    })
                }
            );

            // Create PR
            const prResponse = await this.request(
                `/repos/${owner}/${repo}/pulls`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title: `Fix: ${issue.title}`,
                        body: `Fixes #${issueNumber}\n\n${issue.body || ''}`,
                        head: `${targetOwner}:${branchName}`,
                        base: 'main',
                        maintainer_can_modify: true,
                        draft: true
                    })
                }
            );

            if (!prResponse.ok) {
                const errorText = await prResponse.text();
                throw new Error(errorText);
            }

            const pr = await prResponse.json();
            this.lastCreatedPRUrl = pr.html_url; // Store the created PR URL
            
            return {
                repoUrl: `https://github.com/${targetOwner}/${targetRepo}`,
                branchName: branchName,
                prUrl: pr.html_url
            };
        } catch (error) {
            console.error('PR Creation failed:', error);
            throw new Error(`Failed to setup contribution: ${error.message}`);
        }
    }

    async createPRComment(prUrl, commentBody) {
        const [owner, repo, prNumber] = this.parsePRUrl(prUrl);
        
        try {
            const commentResponse = await this.request(
                `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        body: commentBody
                    })
                }
            );

            if (!commentResponse.ok) {
                const errorText = await commentResponse.text();
                throw new Error(`Failed to add comment: ${errorText}`);
            }

            return await commentResponse.json();
        } catch (error) {
            console.error('Comment creation failed:', error);
            throw error;
        }
    }

    async validatePR(prUrl) {
        const [owner, repo, prNumber] = this.parsePRUrl(prUrl);
        const response = await this.request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
        if (!response.ok) throw new Error('Pull request not accessible');
        return response.json();
    }

    parsePRUrl(prUrl) {
        const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!match) throw new Error('Invalid PR URL format');
        return [match[1], match[2], match[3]];
    }

    request(endpoint, options = {}) {
        return fetch(`${GITHUB_API}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    }
}