/******/ (() => { // webpackBootstrap
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const branchWithoutHead = process.env.GITHUB_REF.replace('refs/heads/', '');
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_');
console.log(`::set-output name=branch::${branchWithoutHead}`);
console.log(`::set-output name=branch_sanitized::${branchName}`);

module.exports = __webpack_exports__;
/******/ })()
;