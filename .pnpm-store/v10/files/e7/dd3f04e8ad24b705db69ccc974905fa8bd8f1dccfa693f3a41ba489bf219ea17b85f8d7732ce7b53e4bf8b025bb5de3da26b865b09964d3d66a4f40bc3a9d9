#!/usr/bin/env node
import {execFileSync} from 'child_process';
import watcher, {AsyncSubscription} from '@parcel/watcher';
import path from 'node:path';
import fs from 'node:fs';
import {debounce} from 'lodash-es';
import {loadEnv} from 'ldenv';

const args = process.argv.slice(2);

function error(msg: string) {
	console.error(msg);
	process.exit(1);
}

let argToConsume;
let command: string | undefined;
let commandArgs: string[] | undefined;
const options: {[key: string]: string[]} = {};
for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	if (arg.startsWith('--')) {
		argToConsume = arg.substring(2);
	} else if (arg.startsWith('-')) {
		argToConsume = arg.substring(1);
	} else {
		if (argToConsume) {
			if (options[argToConsume]) {
				options[argToConsume].push(arg);
			} else {
				options[argToConsume] = [arg];
			}
			argToConsume = undefined;
		} else {
			command = arg;
			commandArgs = args.slice(i + 1);
			break;
		}
	}
}

if (!command) {
	error(`please specify a command`);
}
const commandToUse = command!;

console.log(`"${commandToUse} ${commandArgs?.join(' ') || ''}"`);

if (options['mode'] || options['m']) {
	loadEnv({mode: options['mode'][0] || options['m'][0]});
} else {
	loadEnv();
}


function _execute() {
	try {
		execFileSync(commandToUse, commandArgs, {stdio: ['inherit', 'inherit', 'inherit']});
	} catch (err) {
		console.error('failed to execue', err);
	}
	console.log(`-------------------------------------`);
}

// let counter = 0;
async function subscribe_folder(absolute_path: string, execute: () => void, filename?: string) {
	// const c = ++counter;
	const p = path.relative(process.cwd(), absolute_path) || '.';
	const subscription = await watcher.subscribe(absolute_path, (err, events) => {
		// console.log(`Files changed under ${p} (${c})`);
		if (filename) {
			for (const event of events) {
				if (path.normalize(event.path) === filename) {
					console.log(`"${path.basename(filename)}" changed under ${p}`);
					execute();
				} else if (event.type === 'delete' && event.path === absolute_path) {
					subscription.unsubscribe();
					listen(filename, execute);
					return;
				}
			}
		} else {
			console.log(`Files changed under ${p}`);
			for (const event of events) {
				if (event.type === 'delete' && event.path === absolute_path) {
					subscription.unsubscribe();
					listen(absolute_path, execute);
					return;
				}
			}
			execute();
		}
	});
}

async function listen(absolute_path: string, execute: () => void) {
	const exists = fs.existsSync(absolute_path);

	if (exists) {
		const isDirectory = fs.statSync(absolute_path).isDirectory();
		if (isDirectory) {
			// console.log(`listen for folder changes...`);
			subscribe_folder(absolute_path, execute);
		} else {
			// console.log(`listen for file changes...`);
			subscribe_folder(path.dirname(absolute_path), execute, absolute_path);
		}
	} else {
		const parent = path.dirname(absolute_path);
		if (!fs.existsSync(parent)) {
			console.error(`cannot listen on folder who have no parent yet: ${absolute_path}`);
			process.exit(1);
		}
		// console.log(`${absolute_path} do not exist yet, listening on parent : ${parent}`);
		let tmp_subscription: AsyncSubscription | undefined = await watcher.subscribe(parent, (err, events) => {
			for (const event of events) {
				if (event.type === 'create' && path.normalize(event.path) === absolute_path) {
					// console.log(`${absolute_path} just got created, listening for it...`);
					tmp_subscription?.unsubscribe();
					tmp_subscription = undefined;
					// wrap in a timeout to ensure @parcel/watcher hook on the correct inode?
					setTimeout(() => {
						listen(absolute_path, execute);
					}, 500);
				}
			}
		});
	}
}

async function main() {
	const execute = debounce(_execute, 200);
	execute();
	if (options['w']) {
		const folders = options['w'].map((p) => path.normalize(path.join(process.cwd(), p)));
		for (const folder of folders) {
			listen(folder, execute);

			console.log(`Now listening on ${folder}`);
			console.log(`-------------------------------------`);
		}
	} else {
		const folder = path.normalize(process.cwd());
		console.log(`listening on current folder: ${folder}`);
		listen(folder, execute);
	}
}
main();
