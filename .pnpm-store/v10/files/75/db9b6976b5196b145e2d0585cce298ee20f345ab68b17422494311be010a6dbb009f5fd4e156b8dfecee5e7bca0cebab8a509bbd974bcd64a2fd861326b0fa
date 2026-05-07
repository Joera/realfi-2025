"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotUpdateMode = void 0;
function getSnapshotUpdateMode(env = process.env) {
    if (isCI(env) && shouldUpdate(env)) {
        throw new TypeError("Both CI and UPDATE_SNAPSHOTS are set, however they can't be used together as updating snapshots on the CI is not permitted.");
    }
    if (isCI(env)) {
        return 'none';
    }
    if (shouldUpdate(env)) {
        return 'all';
    }
    return 'new';
}
exports.getSnapshotUpdateMode = getSnapshotUpdateMode;
function isCI(env) {
    return isTrue(env.CI);
}
function shouldUpdate(env) {
    return isTrue(env.UPDATE_SNAPSHOTS);
}
function isTrue(value) {
    return value === 'true' || value === 'yes' || value === '1';
}
//# sourceMappingURL=getSnapshotUpdateMode.js.map