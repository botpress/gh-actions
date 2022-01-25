"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { INPUT_PATH, INPUT_SUBNAME, GITHUB_REF } = process.env;
if (!INPUT_PATH) {
    console.error('Missing value for path param');
    process.exit(1);
}
if (!fs_1.default.existsSync(INPUT_PATH)) {
    console.error("Path doesn't exist");
    process.exit(1);
}
const branchWithoutHead = GITHUB_REF.replace('refs/heads/', '');
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_');
const subName = INPUT_SUBNAME || branchName;
for (const fileName of fs_1.default.readdirSync(INPUT_PATH)) {
    const [name, _version, platform, arch] = fileName.split('-');
    const newName = `${name}-${subName}-${platform}-${arch}`;
    fs_1.default.renameSync(path_1.default.join(INPUT_PATH, fileName), path_1.default.join(INPUT_PATH, newName));
}
