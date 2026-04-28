import {copyFromAllDefault} from './utils/files';

export type Config = {
	foldersOrFiles?: string[];
};

type ResolvedConfig = Config & {foldersOrFiles: string[]};

export async function copyDefaults(config: Config) {
	const resolvedConfig: ResolvedConfig = {foldersOrFiles: ['.'], ...config};

	let anyChanges = false;
	for (const folder of resolvedConfig.foldersOrFiles) {
		anyChanges = copyFromAllDefault(folder) || anyChanges;
	}

	// TODO option to show message ?
	// if (anyChanges) {
	// 	console.log('setting up defaults...');
	// }
}
