// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EnhancedTaskBounty {
    // Structs
    struct Project {
        string name;
        string description;
        string repoUrl;
        uint256 createdAt;
        bool isActive;
        address owner;
    }

    struct Task {
        uint256 projectId;
        string title;
        string description;
        uint256 reward;
        uint256 deadline;
        uint256 createdAt;
        TaskStatus status;
        string[] requiredSkills;
        uint256 difficulty; // 1-5 scale
        uint256 minApprovals;
    }

    // Add explicit PR URL field to Proposal struct
    struct Proposal {
        address hunter;
        string githubPrUrl;  // Already exists, good!
        string description;
        uint256 timestamp;
        uint256 approvalCount;
        ProposalStatus status;
        string[] workLinks;
        mapping(address => bool) approvers;
    }

    enum TaskStatus { Open, InProgress, Completed, Cancelled }
    enum ProposalStatus { Pending, UnderReview, Accepted, Rejected, Disputed }

    // State Variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(uint256 => Proposal)) public proposals; // projectId => taskId => Proposal
    mapping(address => bool) public validators;
    mapping(address => uint256[]) public userProjects; // User's created projects
    mapping(address => uint256[]) public hunterTasks;  // Tasks hunter is working on
    
    uint256 public projectCount;
    uint256 public taskCount;
    address public immutable owner;

    // Events
    event ProjectCreated(uint256 indexed projectId, string name, address owner);
    event TaskCreated(uint256 indexed projectId, uint256 indexed taskId, string title);
    event ProposalSubmitted(uint256 indexed projectId, uint256 indexed taskId, address indexed hunter);
    event ProposalStatusUpdated(uint256 indexed projectId, uint256 indexed taskId, ProposalStatus status);
    event ValidatorAdded(address indexed validator);

    constructor() {
        owner = msg.sender;
        validators[msg.sender] = true;
    }

    // Project Management
    function createProject(
        string memory _name,
        string memory _description,
        string memory _repoUrl
    ) external {
        uint256 projectId = projectCount++;
        Project storage project = projects[projectId];
        project.name = _name;
        project.description = _description;
        project.repoUrl = _repoUrl;
        project.createdAt = block.timestamp;
        project.isActive = true;
        project.owner = msg.sender;

        userProjects[msg.sender].push(projectId);
        emit ProjectCreated(projectId, _name, msg.sender);
    }

    // Task Management
    function createTask(
        uint256 _projectId,
        string memory _title,
        string memory _description,
        uint256 _deadline,
        string[] memory _requiredSkills,
        uint256 _difficulty,
        uint256 _minApprovals
    ) external payable {
        require(projects[_projectId].isActive, "Project not active");
        require(msg.value > 0, "Reward required");
        require(_difficulty >= 1 && _difficulty <= 5, "Invalid difficulty");

        uint256 taskId = taskCount++;
        Task storage task = tasks[taskId];
        task.projectId = _projectId;
        task.title = _title;
        task.description = _description;
        task.reward = msg.value;
        task.deadline = block.timestamp + _deadline;
        task.createdAt = block.timestamp;
        task.status = TaskStatus.Open;
        task.requiredSkills = _requiredSkills;
        task.difficulty = _difficulty;
        task.minApprovals = _minApprovals;

        emit TaskCreated(_projectId, taskId, _title);
    }

    // Proposal Management
    function submitProposal(
        uint256 _projectId,
        uint256 _taskId,
        string memory _githubPrUrl,
        string memory _description,
        string[] memory _workLinks
    ) external {
        require(tasks[_taskId].status == TaskStatus.Open, "Task not open");
        require(block.timestamp < tasks[_taskId].deadline, "Task expired");

        Proposal storage proposal = proposals[_projectId][_taskId];
        proposal.hunter = msg.sender;
        proposal.githubPrUrl = _githubPrUrl;
        proposal.description = _description;
        proposal.timestamp = block.timestamp;
        proposal.status = ProposalStatus.Pending;
        proposal.workLinks = _workLinks;

        hunterTasks[msg.sender].push(_taskId);
        tasks[_taskId].status = TaskStatus.InProgress;

        emit ProposalSubmitted(_projectId, _taskId, msg.sender);
    }

    // Validator Functions
    function reviewProposal(
        uint256 _projectId,
        uint256 _taskId,
        bool _approved
    ) external {
        require(validators[msg.sender], "Not a validator");
        Proposal storage proposal = proposals[_projectId][_taskId];
        require(!proposal.approvers[msg.sender], "Already reviewed");

        proposal.approvers[msg.sender] = true;
        if (_approved) {
            proposal.approvalCount++;
            if (proposal.approvalCount >= tasks[_taskId].minApprovals) {
                _approveProposal(_projectId, _taskId);
            } else {
                proposal.status = ProposalStatus.UnderReview;
            }
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalStatusUpdated(_projectId, _taskId, proposal.status);
    }

    function _approveProposal(uint256 _projectId, uint256 _taskId) private {
        Proposal storage proposal = proposals[_projectId][_taskId];
        Task storage task = tasks[_taskId];

        proposal.status = ProposalStatus.Accepted;
        task.status = TaskStatus.Completed;
        payable(proposal.hunter).transfer(task.reward);
    }

    // View Functions
    function getProjectTasks(uint256 _projectId) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].projectId == _projectId) {
                count++;
            }
        }

        uint256[] memory projectTasks = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].projectId == _projectId) {
                projectTasks[index] = i;
                index++;
            }
        }

        return projectTasks;
    }

    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }

    function getHunterTasks(address _hunter) external view returns (uint256[] memory) {
        return hunterTasks[_hunter];
    }
}