#! /usr/bin/env node

import {Command, Option} from 'commander';
import pkg from '../package.json';
import {copyDefaults} from '.';
const name = pkg.name;

const program = new Command();
program
	.name(name)
	.version(pkg.version)
	.usage(`[dirs|files...]`)
	.argument(`[dirs|files...]`)
	.description('copy default files to their respective filename')
	.action((foldersOrFiles: string[]) => {
		copyDefaults({foldersOrFiles: foldersOrFiles || ['.']});
	});

program.parse();
