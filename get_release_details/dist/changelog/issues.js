"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
const conventional_changelog_angular_1 = __importDefault(require("conventional-changelog-angular"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const RELEASE_BRANCHES = `release/`;
const WHITELISTED_PR_TYPES = ['fix', 'feat'];
const CLOSES_ISSUES_KEYWORDS = [
    'closes',
    'close',
    'closed',
    'fixes',
    'fixe',
    'fixed',
    'resolves',
    'resolve',
    'resolved'
];
const CLOSES_ISSUES_KEYWORDS_REGEX = new RegExp(CLOSES_ISSUES_KEYWORDS.join('|'), 'i');
const REGEX_ISSUES = /(?:(?<![/\w-.])\w[\w-.]+?\/\w[\w-.]+?#|(?:https:\/\/github\.com\/\w[\w-.]+?\/\w[\w-.]+?\/issues\/)|\B#)[1-9]\d*?\b/g;
const REGEX_OWNER_REPO = /^https:\/\/github.com\/(.+)\/(.+)\/issues\/.*/;
const REGEX_NUMBER = /[1-9]\d*/g;
class Transformer {
    constructor() {
        this.pullRequestNumbers = [];
        this.pullRequestIssues = {};
        this.fetchPullRequestNumbers = (commit, _context) => {
            if (!WHITELISTED_PR_TYPES.some((value) => { var _b; return (_b = commit.type) === null || _b === void 0 ? void 0 : _b.includes(value); })) {
                return false;
            }
            // We only want the first issue as it is the PR number
            if (commit.references.length) {
                const issue = commit.references[0].issue;
                core.debug(`Found PR #${issue}`);
                this.pullRequestNumbers.push(Number(issue));
            }
            return commit;
        };
        this.referenceIssues = (commit, _context) => {
            if (!WHITELISTED_PR_TYPES.some((value) => { var _b; return (_b = commit.type) === null || _b === void 0 ? void 0 : _b.includes(value); })) {
                return false;
            }
            // We only want the first issue as it is the PR number
            if (commit.references.length) {
                const issue = commit.references[0].issue;
                const issues = this.pullRequestIssues[Number(issue)] || {};
                for (const { issue, owner, repository } of Object.values(issues)) {
                    commit.references.push({
                        action: 'closes',
                        owner,
                        repository,
                        issue: issue.replace('#', ''),
                        raw: issue,
                        prefix: '#'
                    });
                }
            }
            return commit;
        };
        this.getIssues = async (owner, repo) => {
            const token = core.getInput('token');
            for (const pull_number of this.pullRequestNumbers) {
                try {
                    const octokit = github.getOctokit(token);
                    const pr = await octokit.rest.pulls.get({
                        owner,
                        repo,
                        pull_number
                    });
                    const branch = pr.data.head.ref;
                    const description = pr.data.body;
                    // Skip in case the PR description is empty or if it's the release PR
                    if (!description || branch.includes(RELEASE_BRANCHES)) {
                        continue;
                    }
                    core.debug(`PR #${pull_number} Description: ${description}`);
                    const issues = this.extractIssues(description);
                    if (Object.keys(issues).length) {
                        core.debug(`PR #${pull_number} Found issues: ${JSON.stringify(issues, undefined, 4)}`);
                        this.pullRequestIssues[pull_number] = issues;
                    }
                }
                catch (err) {
                    core.error(`Pull Request #${pull_number} does not exists ${err}`);
                }
            }
        };
        this.extractIssues = (description) => {
            var _b;
            const issues = {};
            const relevantLines = description.split('\n').filter((line) => CLOSES_ISSUES_KEYWORDS_REGEX.test(line));
            for (const line of relevantLines) {
                const matches = line.match(REGEX_ISSUES) || [];
                for (const match of matches) {
                    core.debug(`Found a match: ${match}`);
                    const issue = (_b = match.match(REGEX_NUMBER)) === null || _b === void 0 ? void 0 : _b[0];
                    if (issue) {
                        // e.g. ownerRepoMatches = [ 'https://github.com/owner/repo/issues/11', 'owner', 'repo' ]
                        const ownerRepoMatches = match.match(REGEX_OWNER_REPO);
                        let owner = (ownerRepoMatches === null || ownerRepoMatches === void 0 ? void 0 : ownerRepoMatches[1]) || null;
                        let repository = (ownerRepoMatches === null || ownerRepoMatches === void 0 ? void 0 : ownerRepoMatches[2]) || null;
                        core.debug(`Owner, repository and issue: ${owner}/${repository} ${issue}`);
                        issues[issue] = { issue, owner, repository };
                    }
                }
            }
            return issues;
        };
    }
}
exports.Transformer = Transformer;
_a = Transformer;
Transformer.defaultTransform = async () => (await conventional_changelog_angular_1.default).conventionalChangelog.writerOpts.transform;
