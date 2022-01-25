"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseFromCallback = void 0;
const PromiseFromCallback = async (func) => {
    return new Promise((resolve, reject) => {
        const callback = (e, r) => {
            if (e) {
                reject(e);
            }
            else if (r) {
                resolve(r);
            }
        };
        func(callback);
    });
};
exports.PromiseFromCallback = PromiseFromCallback;
