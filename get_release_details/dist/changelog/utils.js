"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicates = exports.WHITELISTED_SECTIONS = exports.BASE_PATH = void 0;
exports.BASE_PATH = process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE || '';
exports.WHITELISTED_SECTIONS = ['', '### Bug Fixes', '### Features'];
/**
 * This function removes duplicates to the changelog of the latest version in a list of changelogs
 *
 * *Note: It does not remove duplicates if there is any inside the changelog of the latest version*
 *
 * @param changelog The complete changelog to search duplicates on
 * @param previousVersion The version before the latest version contained in the changelog
 * @returns The latest changelog without duplicates
 */
const removeDuplicates = (changelog, previousVersion) => {
    const prevVersionMark = previousVersion.endsWith('0') ? `# [${previousVersion}]` : `## [${previousVersion}]`;
    const preVersionIdx = changelog.indexOf(prevVersionMark);
    const newLines = changelog.slice(0, preVersionIdx).split('\n');
    const prevContent = changelog.slice(preVersionIdx);
    const finalNewLines = newLines
        .map((l) => (exports.WHITELISTED_SECTIONS.includes(l) || !prevContent.includes(l)) && l)
        .filter((l) => typeof l === 'string')
        .join('\n');
    return finalNewLines;
};
exports.removeDuplicates = removeDuplicates;
