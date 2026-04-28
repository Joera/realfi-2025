export function getSnapshotUpdateMode(env = process.env) {
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