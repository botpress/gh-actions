"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const create = async () => {
    const sshFolder = path_1.default.join(process.env.HOME, '.ssh');
    fs_1.default.mkdirSync(sshFolder, { recursive: true, mode: 0o700 });
    const hostInfo = await new Promise((resolve, reject) => (0, child_process_1.exec)(`ssh-keyscan -H "${process.env.INPUT_HOST || 'github.com'}"`, (err, res) => {
        if (err) {
            reject(err);
        }
        else if (res) {
            resolve(res);
        }
    }));
    fs_1.default.writeFileSync(path_1.default.join(sshFolder, 'known_hosts'), hostInfo, { mode: 0o644, flag: 'a' });
    fs_1.default.writeFileSync(path_1.default.join(sshFolder, 'id_rsa'), process.env.INPUT_SSH_KEY, { mode: 0o400, flag: 'wx' });
};
create();
