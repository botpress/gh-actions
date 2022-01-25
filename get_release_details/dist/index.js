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
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const core = __importStar(require("@actions/core"));
const changelog_1 = require("./changelog/changelog");
const utils_1 = require("./changelog/utils");
const utils_2 = require("./utils");
const getLastTag = async () => {
    try {
        const tag = await (0, utils_2.PromiseFromCallback)((cb) => (0, child_process_1.exec)('git describe --tags --abbrev=0', cb));
        if (/^v\d/.test(tag)) {
            return tag;
        }
    }
    catch (err) {
        core.setFailed(`Could not fetch last tag ${err}`);
    }
};
const run = async () => {
    try {
        const lastReleaseTag = await getLastTag();
        const previousVersion = lastReleaseTag === null || lastReleaseTag === void 0 ? void 0 : lastReleaseTag.replace(/^v/, '');
        core.setOutput('latest_tag', lastReleaseTag);
        const pkg = await (0, utils_2.PromiseFromCallback)((cb) => fs_1.default.readFile(path_1.default.resolve(utils_1.BASE_PATH, 'package.json'), 'utf-8', cb));
        const currentVersion = JSON.parse(pkg).version;
        const isNewRelease = previousVersion !== currentVersion;
        core.setOutput('version', currentVersion);
        core.setOutput('is_new_release', isNewRelease);
        // No need to generate changelogs when it's not a new release
        const changelog = isNewRelease ? await (0, changelog_1.buildChangelog)() : '';
        core.setOutput('changelog', changelog);
    }
    catch (err) {
        core.setFailed(err);
    }
};
run();
