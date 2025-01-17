// main.js
import init, { BountyInterface } from '/pkg/bounty_project.js';
import { GitHubIntegration } from './github-integration.js';

// State management
let currentAccount = null;
let bountyInterface = null;
let isValidator = false;
let githubIntegration = null;
const githubToken = 'YOUR_TOKEN_HERE'; // Create your own token via github and paste it here (classic token, not fine-grained).
let proposalPRs = new Map(); // Store PR URLs by proposal ID

async function initialize() {
    try {
        await init();
        const contractAddress = "0xDE4eADf86cdC4B4E952439c24FbeD634728C6428";
        bountyInterface = new BountyInterface(contractAddress);
        bountyInterface.connect();
        githubIntegration = new GitHubIntegration(githubToken);
        setupEventListeners();
        ToastManager.success('Application initialized successfully');
    } catch (error) {
        console.error("Initialization failed:", error);
        ToastManager.error('Failed to initialize application');
    }
}

function setupEventListeners() {
    document.getElementById('connect-wallet')?.addEventListener('click', connectWallet);
    document.getElementById('connect-repo')?.addEventListener('click', connectToGitHub);
    document.getElementById('solution-form')?.addEventListener('submit', handleSolutionSubmit);
    document.getElementById('sort-order')?.addEventListener('change', updateProposalsList);
}

async function connectWallet() {
    if (!window.ethereum) {
        showError('Please install MetaMask to use this application');
        return;
    }

    try {
        showLoading('Connecting wallet...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];

        updateConnectionStatus();
        isValidator = await bountyInterface.is_validator(currentAccount);
        document.getElementById('validator-panel')?.classList.toggle('hidden', !isValidator);
        
        if (isValidator) {
            await updateValidatorStats();
        }
        
        await updateProposalsList();
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        showError('Failed to connect wallet');
    } finally {
        hideLoading();
    }
}

function sortProposals(proposals) {
    return proposals.sort((a, b) => {
        const order = document.getElementById('sort-order')?.value === 'newest' ? -1 : 1;
        return order * (a.timestamp - b.timestamp);
    });
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    const connectButton = document.getElementById('connect-wallet');
    
    if (statusElement && connectButton) {
        statusElement.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        connectButton.textContent = 'CONNECTED';
        connectButton.disabled = true;
    }
}

async function connectToGitHub() {
    const repoInput = document.getElementById('repo-url');
    const repoUrl = repoInput?.value;
    
    if (!repoUrl) {
        showError('Please enter a repository URL');
        return;
    }

    try {
        showLoading('Connecting to GitHub...');
        await githubIntegration.connect(repoUrl);
        updateRepoStatus();
        document.getElementById('issues-section')?.classList.remove('hidden');
        await updateIssuesList();
    } catch (error) {
        console.error('Failed to connect to GitHub:', error);
        showError('Failed to connect to repository');
    } finally {
        hideLoading();
    }
}

function updateRepoStatus() {
    const repoStatus = document.getElementById('repo-status');
    if (repoStatus && githubIntegration.connectedRepo) {
        const { owner, repo } = githubIntegration.connectedRepo;
        repoStatus.textContent = `Connected to: ${owner}/${repo}`;
        repoStatus.className = 'status success';
    }
}

async function updateIssuesList() {
    if (!githubIntegration.isConnected) {
        console.error('GitHub integration is not connected');
        return;
    }

    try {
        console.log('Attempting to fetch issues...');
        const issues = await githubIntegration.getIssues();
        const container = document.querySelector('.issues-grid');
        
        if (!container) {
            console.error('Issues container not found');
            return;
        }

        console.log(`Received ${issues.length} issues`);

        if (issues.length === 0) {
            console.warn('No issues found');
            container.innerHTML = '<div class="no-issues">No open issues found</div>';
            return;
        }

        container.innerHTML = issues.map(issue => `
            <div class="issue-card">
                <div class="issue-header">
                    <span class="issue-number">#${issue.number}</span>
                    <span class="issue-status">Open</span>
                </div>
                <h3>${issue.title}</h3>
                <p>${issue.body ? issue.body.slice(0, 150) + '...' : 'No description'}</p>
                <div class="issue-footer">
                    <span class="timestamp">Created: ${new Date(issue.created_at).toLocaleDateString()}</span>
                    ${currentAccount ? `
                        <button onclick="showWorkflowModal(${issue.number})" class="button">
                            Submit Solution
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch issues:', error);
        showError('Failed to load issues: ' + error.message);
    }
}

function showWorkflowModal(issueNumber) {
    const modal = document.getElementById('workflow-modal');
    if (modal) {
        modal.setAttribute('data-issue-number', issueNumber);
        document.getElementById('branch-command').textContent = `git checkout -b fix/issue-${issueNumber}`;
        document.getElementById('clone-command').textContent = 'Waiting for setup...';
        modal.classList.remove('hidden');
    }
}

function closeWorkflowModal() {
    const modal = document.getElementById('workflow-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.removeAttribute('data-issue-number');
    }
}

async function handleForkRepo() {
    if (!githubIntegration.isConnected) {
        showError('GitHub connection is not properly configured');
        return;
    }

    const modal = document.getElementById('workflow-modal');
    const issueNumber = modal?.getAttribute('data-issue-number');
    
    if (!issueNumber) {
        showError('No issue number found');
        return;
    }

    try {
        showLoading('Forking repository and creating branch...');
        const result = await githubIntegration.forkAndCreateBranch(issueNumber);
        
        // Update clone and branch commands
        document.getElementById('clone-command').textContent = `git clone ${result.repoUrl}`;
        document.getElementById('branch-command').textContent = `git checkout -b ${result.branchName}`;
        
        showSuccess('Repository forked and branch created successfully!');
    } catch (error) {
        console.error('Setup Failed:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function prepareAndShowSolutionModal() {
    const modal = document.getElementById('workflow-modal');
    const issueNumber = modal?.getAttribute('data-issue-number');
    
    if (!issueNumber) {
        showError('No issue number found');
        return;
    }

    try {
        showLoading('Creating pull request...');
        const result = await githubIntegration.createBranchAndPR(issueNumber);
        
        closeWorkflowModal();
        showSolutionModal(issueNumber, result.prUrl);
        
        showSuccess('Pull request created successfully!');
    } catch (error) {
        console.error('Setup Failed:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function showSolutionModal(issueNumber, prUrl = '') {
    closeWorkflowModal();
    const modal = document.getElementById('solution-modal');
    const issueNumberInput = document.getElementById('issue-number');
    const prUrlInput = document.getElementById('pr-url');
    
    if (modal && issueNumberInput && prUrlInput) {
        issueNumberInput.value = issueNumber;
        if (prUrl) {
            prUrlInput.value = prUrl;
        }
        modal.classList.remove('hidden');
    }
}

function closeSolutionModal() {
    const modal = document.getElementById('solution-modal');
    const form = document.getElementById('solution-form');
    
    if (modal && form) {
        modal.classList.add('hidden');
        form.reset();
    }
}

async function handleSolutionSubmit(event) {
    event.preventDefault();
    
    if (!currentAccount || !githubIntegration.isConnected) {
        showError('Please connect your wallet and repository');
        return;
    }
  
    const prUrl = document.getElementById('pr-url').value.trim();
    const additionalNotes = document.getElementById('solution-notes').value.trim();
  
    try {
        showLoading('Submitting solution...');
        const prDetails = await githubIntegration.validatePR(prUrl);
        
        if (additionalNotes.trim()) {
            await githubIntegration.createPRComment(prUrl, additionalNotes);
        }
  
        await bountyInterface.submit_proposal(prUrl, additionalNotes, currentAccount);
        // Store the PR URL with the next proposal ID
        proposalPRs.set(bountyInterface.next_proposal_id - 1, prUrl);
        
        closeSolutionModal();
        await updateProposalsList();
        showSuccess('Solution submitted successfully!');
    } catch (error) {
        console.error('Submission Failed:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}
  async function updateProposalsList(prUrl = null) {
    if (!bountyInterface) return;
  
    try {
      const proposals = await bountyInterface.get_proposals();
      const sortedProposals = sortProposals(proposals);
      displayProposals(sortedProposals, prUrl);
    } catch (error) {
      console.error('Failed to update proposals:', error);
    }
  }

  function displayProposals(proposals) {
    const container = document.querySelector('.proposals-grid');
    if (!container) return;
  
    if (!proposals || proposals.length === 0) {
        container.innerHTML = '<div class="no-proposals">No proposals match your filters</div>';
        return;
    }
  
    container.innerHTML = proposals.map((proposal) => {
        const prUrl = proposal.github_pr_url;  // Use the URL stored in the proposal
        return `
            <div class="proposal-card">
                <div class="proposal-header">
                    <span class="proposal-id">#${proposal.id}</span>
                </div>
                <div class="proposal-content">
                    <p>${proposal.description || 'No description available'}</p>
                    <a href="${prUrl}" target="_blank" class="pr-link">View PR</a>
                </div>
            </div>
        `;
    }).join('');
}

async function approveProposal(proposalId) {
    if (!isValidator || !currentAccount) return;

    try {
        showLoading('Approving proposal...');
        await bountyInterface.approve_proposal(proposalId, currentAccount);
        await updateProposalsList();
        await updateValidatorStats();
        showSuccess('Proposal approved successfully');
    } catch (error) {
        console.error('Failed to approve proposal:', error);
        showError('Failed to approve proposal');
    } finally {
        hideLoading();
    }
}

async function updateValidatorStats() {
    if (!isValidator || !bountyInterface) return;

    try {
        const proposals = await bountyInterface.get_proposals();
        const reviewedCount = proposals.filter(p => p.approvers?.includes(currentAccount)).length;
        const pendingCount = proposals.filter(p => !p.approvers?.includes(currentAccount)).length;

        document.getElementById('reviewed-count').textContent = reviewedCount;
        document.getElementById('pending-count').textContent = pendingCount;
    } catch (error) {
        console.error('Failed to update validator stats:', error);
    }
}

async function handleFiltersChange() {
    await updateProposalsList();
}

function showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay?.querySelector('.loading-text');
    if (overlay && text) {
        text.textContent = message;
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    document.getElementById('loading-overlay')?.classList.add('hidden');
}

function showError(message) {
    console.error(message);
    ToastManager.error(message);
}

function showSuccess(message) {
    console.log(message);
    ToastManager.success(message);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        navigator.clipboard.writeText(element.textContent);
        ToastManager.success('Copied to clipboard');
    }
}

class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.classList.add('toast', `${type}`);
        toast.textContent = message;
        container.appendChild(toast);

        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove toast after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }
}

// Expose necessary functions to window
window.ToastManager = ToastManager;
window.showWorkflowModal = showWorkflowModal;
window.closeWorkflowModal = closeWorkflowModal;
window.handleForkRepo = handleForkRepo;
window.copyToClipboard = copyToClipboard;
window.showSolutionModal = showSolutionModal;
window.closeSolutionModal = closeSolutionModal;
window.approveProposal = approveProposal;
window.prepareAndShowSolutionModal = prepareAndShowSolutionModal;

// Initialize the application
initialize();