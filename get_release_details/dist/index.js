var $1XF4n$child_process = require("child_process");
var $1XF4n$path = require("path");
var $1XF4n$fs = require("fs");
var $1XF4n$actionscore = require("@actions/core");
var $1XF4n$conventionalchangelog = require("conventional-changelog");
var $1XF4n$conventionalchangelogangular = require("conventional-changelog-angular");
var $1XF4n$actionsgithub = require("@actions/github");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}










var $58e3b393b91cdeef$var$_a;
const $58e3b393b91cdeef$var$RELEASE_BRANCHES = `release/`;
const $58e3b393b91cdeef$var$WHITELISTED_PR_TYPES = [
    'fix',
    'feat'
];
const $58e3b393b91cdeef$var$CLOSES_ISSUES_KEYWORDS = [
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
const $58e3b393b91cdeef$var$CLOSES_ISSUES_KEYWORDS_REGEX = new RegExp($58e3b393b91cdeef$var$CLOSES_ISSUES_KEYWORDS.join('|'), 'i');
const $58e3b393b91cdeef$var$REGEX_ISSUES = /(?:(?<![/\w-.])\w[\w-.]+?\/\w[\w-.]+?#|(?:https:\/\/github\.com\/\w[\w-.]+?\/\w[\w-.]+?\/issues\/)|\B#)[1-9]\d*?\b/g;
const $58e3b393b91cdeef$var$REGEX_OWNER_REPO = /^https:\/\/github.com\/(.+)\/(.+)\/issues\/.*/;
const $58e3b393b91cdeef$var$REGEX_NUMBER = /[1-9]\d*/g;
class $58e3b393b91cdeef$export$f993aef960936087 {
    constructor(){
        this.pullRequestNumbers = [];
        this.pullRequestIssues = {
        };
        this.fetchPullRequestNumbers = (commit, _context)=>{
            if (!$58e3b393b91cdeef$var$WHITELISTED_PR_TYPES.some((value)=>{
                var _b;
                return (_b = commit.type) === null || _b === void 0 ? void 0 : _b.includes(value);
            })) return false;
            // We only want the first issue as it is the PR number
            if (commit.references.length) {
                const issue = commit.references[0].issue;
                $1XF4n$actionscore.debug(`Found PR #${issue}`);
                this.pullRequestNumbers.push(Number(issue));
            }
            return commit;
        };
        this.referenceIssues = (commit, _context)=>{
            if (!$58e3b393b91cdeef$var$WHITELISTED_PR_TYPES.some((value)=>{
                var _b;
                return (_b = commit.type) === null || _b === void 0 ? void 0 : _b.includes(value);
            })) return false;
            // We only want the first issue as it is the PR number
            if (commit.references.length) {
                const issue = commit.references[0].issue;
                const issues = this.pullRequestIssues[Number(issue)] || {
                };
                for (const { issue: issue1 , owner: owner , repository: repository  } of Object.values(issues))commit.references.push({
                    action: 'closes',
                    owner: owner,
                    repository: repository,
                    issue: issue1.replace('#', ''),
                    raw: issue1,
                    prefix: '#'
                });
            }
            return commit;
        };
        this.getIssues = async (owner, repo)=>{
            const token = $1XF4n$actionscore.getInput('token');
            for (const pull_number of this.pullRequestNumbers)try {
                const octokit = $1XF4n$actionsgithub.getOctokit(token);
                const pr = await octokit.rest.pulls.get({
                    owner: owner,
                    repo: repo,
                    pull_number: pull_number
                });
                const branch = pr.data.head.ref;
                const description = pr.data.body;
                // Skip in case the PR description is empty or if it's the release PR
                if (!description || branch.includes($58e3b393b91cdeef$var$RELEASE_BRANCHES)) continue;
                $1XF4n$actionscore.debug(`PR #${pull_number} Description: ${description}`);
                const issues = this.extractIssues(description);
                if (Object.keys(issues).length) {
                    $1XF4n$actionscore.debug(`PR #${pull_number} Found issues: ${JSON.stringify(issues, undefined, 4)}`);
                    this.pullRequestIssues[pull_number] = issues;
                }
            } catch (err) {
                $1XF4n$actionscore.error(`Pull Request #${pull_number} does not exists ${err}`);
            }
        };
        this.extractIssues = (description)=>{
            var _b;
            const issues = {
            };
            const relevantLines = description.split('\n').filter((line)=>$58e3b393b91cdeef$var$CLOSES_ISSUES_KEYWORDS_REGEX.test(line)
            );
            for (const line1 of relevantLines){
                const matches = line1.match($58e3b393b91cdeef$var$REGEX_ISSUES) || [];
                for (const match of matches){
                    $1XF4n$actionscore.debug(`Found a match: ${match}`);
                    const issue = (_b = match.match($58e3b393b91cdeef$var$REGEX_NUMBER)) === null || _b === void 0 ? void 0 : _b[0];
                    if (issue) {
                        // e.g. ownerRepoMatches = [ 'https://github.com/owner/repo/issues/11', 'owner', 'repo' ]
                        const ownerRepoMatches = match.match($58e3b393b91cdeef$var$REGEX_OWNER_REPO);
                        let owner = (ownerRepoMatches === null || ownerRepoMatches === void 0 ? void 0 : ownerRepoMatches[1]) || null;
                        let repository = (ownerRepoMatches === null || ownerRepoMatches === void 0 ? void 0 : ownerRepoMatches[2]) || null;
                        $1XF4n$actionscore.debug(`Owner, repository and issue: ${owner}/${repository} ${issue}`);
                        issues[issue] = {
                            issue: issue,
                            owner: owner,
                            repository: repository
                        };
                    }
                }
            }
            return issues;
        };
    }
}
$58e3b393b91cdeef$var$_a = $58e3b393b91cdeef$export$f993aef960936087;
$58e3b393b91cdeef$export$f993aef960936087.defaultTransform = async ()=>(await ($parcel$interopDefault($1XF4n$conventionalchangelogangular))).conventionalChangelog.writerOpts.transform
;


const $07a7dee53bc9edc6$export$2812a1fb15aca49c = '';
const $07a7dee53bc9edc6$export$c3d16095baac4b63 = [
    '',
    '### Bug Fixes',
    '### Features'
];
const $07a7dee53bc9edc6$export$2e2262a44ac61957 = (changelog, previousVersion)=>{
    const prevVersionMark = previousVersion.endsWith('0') ? `# [${previousVersion}]` : `## [${previousVersion}]`;
    const preVersionIdx = changelog.indexOf(prevVersionMark);
    const newLines = changelog.slice(0, preVersionIdx).split('\n');
    const prevContent = changelog.slice(preVersionIdx);
    const finalNewLines = newLines.map((l)=>($07a7dee53bc9edc6$export$c3d16095baac4b63.includes(l) || !prevContent.includes(l)) && l
    ).filter((l)=>typeof l === 'string'
    ).join('\n');
    return finalNewLines;
};


const $47b7633cb300196d$export$fbbd5969c349971 = async (func)=>{
    return new Promise((resolve, reject)=>{
        const callback = (e, r)=>{
            if (e) reject(e);
            else if (r) resolve(r);
        };
        func(callback);
    });
};


const $797589f52db6c6eb$var$updateChangelog = async (text)=>{
    const filePath = ($parcel$interopDefault($1XF4n$path)).join($07a7dee53bc9edc6$export$2812a1fb15aca49c, 'CHANGELOG.md');
    // Checks if file exists
    if (!await $47b7633cb300196d$export$fbbd5969c349971((cb)=>($parcel$interopDefault($1XF4n$fs)).access(filePath, cb)
    )) return;
    const existingChangelog = await $47b7633cb300196d$export$fbbd5969c349971((cb)=>($parcel$interopDefault($1XF4n$fs)).readFile(filePath, {
            encoding: 'utf-8'
        }, cb)
    );
    return $47b7633cb300196d$export$fbbd5969c349971((cb)=>($parcel$interopDefault($1XF4n$fs)).writeFile(filePath, `${text}${existingChangelog}`, {
            encoding: 'utf-8'
        }, cb)
    );
};
const $797589f52db6c6eb$export$63ec1fe1e2cf4420 = async ()=>{
    // The transformer is use to extract issues closed by Pull Requests
    const transformer = new $58e3b393b91cdeef$export$f993aef960936087();
    const defaultTransform = await $58e3b393b91cdeef$export$f993aef960936087.defaultTransform();
    // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
    const changelogOts = {
        preset: 'angular',
        releaseCount: 1
    };
    const context1 = {
    };
    const gitRawCommitsOpts = {
        merges: null
    };
    const commitsParserOpts = {
        mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
        mergeCorrespondence: [
            'id',
            'source'
        ]
    };
    // Since fetching pull request information requires the code to be async,
    // we have to run changelog once using the custom transformer and then
    // re-running it with the default one afterwards
    await $47b7633cb300196d$export$fbbd5969c349971((cb)=>($parcel$interopDefault($1XF4n$conventionalchangelog))(changelogOts, context1, gitRawCommitsOpts, commitsParserOpts, {
            transform: transformer.fetchPullRequestNumbers
        }).on('data', ()=>{
        }).on('end', cb).on('error', cb)
    );
    // We fetch the issues referenced in Pull Requests we just crawled
    const [owner, repo] = undefined.split('/');
    await transformer.getIssues(owner, repo);
    let text = '';
    const stream = ($parcel$interopDefault($1XF4n$conventionalchangelog))(changelogOts, context1, gitRawCommitsOpts, commitsParserOpts, {
        transform: (commit, context)=>{
            transformer.referenceIssues(commit, context);
            return defaultTransform(commit, context);
        }
    });
    stream.on('data', (chunk)=>text += chunk
    );
    await $47b7633cb300196d$export$fbbd5969c349971((cb)=>stream.on('end', cb).on('error', cb)
    );
    text = text.toString();
    await $797589f52db6c6eb$var$updateChangelog(text);
    return text;
};




const $b1b2287e7d3d1230$var$getLastTag = async ()=>{
    try {
        const tag = await $47b7633cb300196d$export$fbbd5969c349971((cb)=>$1XF4n$child_process.exec('git describe --tags --abbrev=0', cb)
        );
        if (/^v\d/.test(tag)) return tag;
    } catch (err) {
        $1XF4n$actionscore.setFailed(`Could not fetch last tag ${err}`);
    }
};
const $b1b2287e7d3d1230$var$run = async ()=>{
    try {
        const lastReleaseTag = await $b1b2287e7d3d1230$var$getLastTag();
        const previousVersion = lastReleaseTag === null || lastReleaseTag === void 0 ? void 0 : lastReleaseTag.replace(/^v/, '');
        $1XF4n$actionscore.setOutput('latest_tag', lastReleaseTag);
        const pkg = await $47b7633cb300196d$export$fbbd5969c349971((cb)=>($parcel$interopDefault($1XF4n$fs)).readFile(($parcel$interopDefault($1XF4n$path)).resolve($07a7dee53bc9edc6$export$2812a1fb15aca49c, 'package.json'), 'utf-8', cb)
        );
        const currentVersion = JSON.parse(pkg).version;
        const isNewRelease = previousVersion !== currentVersion;
        $1XF4n$actionscore.setOutput('version', currentVersion);
        $1XF4n$actionscore.setOutput('is_new_release', isNewRelease);
        // No need to generate changelogs when it's not a new release
        const changelog = isNewRelease ? await $797589f52db6c6eb$export$63ec1fe1e2cf4420() : '';
        $1XF4n$actionscore.setOutput('changelog', changelog);
    } catch (err) {
        $1XF4n$actionscore.setFailed(err);
    }
};
$b1b2287e7d3d1230$var$run();


