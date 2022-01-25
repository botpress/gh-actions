"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChangelog = void 0;
const conventional_changelog_1 = __importDefault(require("conventional-changelog"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const issues_1 = require("./issues");
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const updateChangelog = async (text) => {
    const filePath = path_1.default.join(utils_1.BASE_PATH, 'CHANGELOG.md');
    // Checks if file exists
    if (!(await (0, utils_2.PromiseFromCallback)((cb) => fs_1.default.access(filePath, cb)))) {
        return;
    }
    const existingChangelog = await (0, utils_2.PromiseFromCallback)((cb) => fs_1.default.readFile(filePath, { encoding: 'utf-8' }, cb));
    return (0, utils_2.PromiseFromCallback)((cb) => fs_1.default.writeFile(filePath, `${text}${existingChangelog}`, { encoding: 'utf-8' }, cb));
};
const buildChangelog = async () => {
    // The transformer is use to extract issues closed by Pull Requests
    const transformer = new issues_1.Transformer();
    const defaultTransform = await issues_1.Transformer.defaultTransform();
    // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
    const changelogOts = {
        preset: 'angular',
        releaseCount: 1
    };
    const context = {};
    const gitRawCommitsOpts = {
        merges: null
    };
    const commitsParserOpts = {
        mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
        mergeCorrespondence: ['id', 'source']
    };
    // Since fetching pull request information requires the code to be async,
    // we have to run changelog once using the custom transformer and then
    // re-running it with the default one afterwards
    await (0, utils_2.PromiseFromCallback)((cb) => (0, conventional_changelog_1.default)(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, {
        transform: transformer.fetchPullRequestNumbers
    })
        .on('data', () => { })
        .on('end', cb)
        .on('error', cb));
    // We fetch the issues referenced in Pull Requests we just crawled
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    await transformer.getIssues(owner, repo);
    let text = '';
    const stream = (0, conventional_changelog_1.default)(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, {
        transform: (commit, context) => {
            transformer.referenceIssues(commit, context);
            return defaultTransform(commit, context);
        }
    });
    stream.on('data', (chunk) => (text += chunk));
    await (0, utils_2.PromiseFromCallback)((cb) => stream.on('end', cb).on('error', cb));
    text = text.toString();
    await updateChangelog(text);
    return text;
};
exports.buildChangelog = buildChangelog;
