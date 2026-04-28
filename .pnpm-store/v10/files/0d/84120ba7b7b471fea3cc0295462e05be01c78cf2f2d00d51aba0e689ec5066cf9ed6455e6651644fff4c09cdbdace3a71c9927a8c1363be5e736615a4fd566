import fs from 'node:fs';
import path from 'node:path';

export function copyUnlessExists(from: string, to: string): boolean {
	if (!fs.existsSync(to)) {
		if (fs.existsSync(from)) {
			fs.copyFileSync(from, to);
			return true;
		}
	}
	return false;
}

export function writeIfNotExists(p: string, content: string): boolean {
	if (!fs.existsSync(p)) {
		fs.writeFileSync(p, content);
		return true;
	}
	return false;
}

export function copyFromDefault(p: string): boolean {
	return copyUnlessExists(`${p}.default`, p);
}

export function copyFromAllDefault(folderOrFile: string): boolean {
	if (fs.existsSync(folderOrFile)) {
		if (fs.statSync(folderOrFile).isDirectory()) {
			const files = fs
				.readdirSync(folderOrFile)
				.filter((v) => v.endsWith('.default'))
				.map((v) => path.join(folderOrFile, v.slice(0, v.length - 8)));

			return files.map(copyFromDefault).reduce((prev, curr) => prev || curr, false);
		} else {
			if (!folderOrFile.endsWith('.default')) {
				return false;
			}
			return copyFromDefault(folderOrFile.slice(0, folderOrFile.length - 8));
		}
	} else {
		return false;
	}
}
