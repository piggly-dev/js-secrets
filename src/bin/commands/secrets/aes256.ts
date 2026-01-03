/* eslint-disable no-console */
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Command } from 'commander';
import chalk from 'chalk';

import { parseFileName, parseAbspath, mnemonic, seed } from '@/utils/index.js';
import { generateSecret } from '@/core/index.js';
import * as aes from '@/core/secrets/aes256.js';
import { remove } from '@/utils/indexes.js';
import { exists } from '@/utils/file.js';

/**
 * Generate a secret based on a mnemonic phrase. It should be used with aes256
 * algorithm.
 *
 * @param program - The program to add the command to.
 * @returns The program.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateAES256SecretCommand(program: Command) {
	program
		.command('generate:aes256')
		.description(
			'Generates a secret based on a mnemonic phrase. It should be used with aes256 algorithm.',
		)
		.argument('<name>', 'Name of the key.')
		.option('-p, --path <path>', 'Path to save the key.')
		.option('-w, --password <password>', 'Password for seed generation.')
		.option(
			'-l, --language <language>',
			'Language of mnemonic. Only english is available.',
			'english',
		)
		.option(
			'-s, --strength <strength>',
			'Strength of mnemonic. Default is 128.',
			'128',
		)
		.option(
			'-v, --version <version>',
			'Version of the key. Should be an integer. Default is 1.',
			'1',
		)
		.option(
			'-x, --index <index>',
			'Index name. Will store the key in a JSON index. If not provided, index will not be created.',
		)
		.action(async (n, op) => {
			try {
				const version = parseInt(op.version, 10);
				const key_name = parseFileName(n);
				const index_name = op.index ? parseFileName(op.index) : undefined;
				const abspath = parseAbspath(process.cwd(), op.path);

				if (exists(abspath) === false) {
					throw Error(
						`"Path ${abspath} does not exist. Please create it first."`,
					);
				}

				const generated = await generateSecret(
					'aes256',
					mnemonic({
						language: op.language,
						strength: parseInt(op.strength, 10),
					}),
					abspath,
					key_name,
					{
						index_name,
						seed: {
							password: op.password,
						},
						version,
					},
				);

				console.log(
					chalk.green('Secret key generated at:'),
					generated.files.file,
				);

				if (generated.files.index) {
					console.log(
						chalk.green('Secret key indexed at:'),
						generated.files.index,
					);
				}

				console.log(chalk.green('Mnemonic:'), generated.mnemonic, '\n');

				console.log(
					chalk.yellow(
						'Keep the mnemonic safe! It can be used to recover the key pair.',
					),
				);
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}

			return process.exit(0);
		});
}

/**
 * Recover a secret from a mnemonic and save it to a file. It will remove the
 * previous key from index when index is set.
 *
 * @param program - The program to add the command to.
 * @returns The program.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function recoverAES256SecretCommand(program: Command) {
	program
		.command('recover:aes256')
		.description(
			'Recovers a key-pair from a mnemonic and save it to a file. It will remove the previous key from index when index is set.',
		)
		.argument('<name>', 'Name of the key.')
		.option('-p, --path <path>', 'Path to save the key.')
		.option('-m, --mnemonic <mnemonic>', 'Mnemonic to recover the key.')
		.option('-w, --password <password>', 'Password for seed generation.')
		.option(
			'-v, --version <version>',
			'Version of the key. Should be an integer. Default is 1.',
			'1',
		)
		.option(
			'-x, --index <index>',
			'Index name. Will store the key in a JSON index. If not provided, index will not be created.',
		)
		.action(async (n, v, op) => {
			try {
				const { mnemonic } = op;

				if (mnemonic === undefined || mnemonic === '') {
					throw Error('Mnemonic is required.');
				}

				const version = parseInt(v, 10);
				const key_name = parseFileName(n);
				const index_name = op.index ? parseFileName(op.index) : undefined;
				const abspath = parseAbspath(op.path);

				if (index_name) {
					await remove('secrets', abspath, index_name, version);
				}

				const generated = await generateSecret(
					'aes256',
					mnemonic,
					abspath,
					key_name,
					{
						index_name,
						recover: true,
						seed: {
							password: op.password,
						},
						version,
					},
				);

				console.log(
					chalk.green('Secret key recovered at:'),
					generated.files.file,
				);

				if (generated.files.index) {
					console.log(
						chalk.green('Secret key reindexed at:'),
						generated.files.index,
					);
				}

				console.log(chalk.green('Mnemonic:'), generated.mnemonic, '\n');

				console.log(
					chalk.yellow(
						'Keep the mnemonic safe! It can be used again to recover the key pair.',
					),
				);
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}

			return process.exit(0);
		});
}

/**
 * Generate a secret based on a mnemonic phrase. It should be used with aes256
 * algorithm.
 *
 * @param program - The program to add the command to.
 * @returns The program.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateMnemonicSecretCommand(program: Command) {
	program
		.command('generate:secret')
		.description('Generates a secret based on a mnemonic phrase.')
		.option(
			'-p, --abspath [path]',
			'Absolute path to save the secret. If not provided, it will be displayed in the terminal.',
		)
		.option(
			'-f, --filename [filename]',
			'File name to save the secret. If not provided, it will be saved in the "encryption.key" file.',
			'encryption.key',
		)
		.option(
			'-s, --salt [salt]',
			'Salt to use for the secret. If not provided, it will be generated randomly.',
		)
		.option(
			'-l, --length [length]',
			'Length of the secret. Default is 32.',
			(v: string): number => {
				if (v === undefined) {
					return 32;
				}

				if (Number.isSafeInteger(parseInt(v, 10)) === false) {
					return -1;
				}

				return Number(v);
			},
		)
		.option(
			'-m, --mnemonic [mnemonic]',
			'Use a specific mnemonic seed to generate the root key. If not provided, a new mnemonic will be generated.',
			undefined,
		)
		.option(
			'-w, --words [words]',
			'Tells the size of works of the mnemonic to be generated. It must be one of the following values: 12 or 24. Default is 12 words.',
			(v: string): number => {
				if (v === undefined) {
					return 12;
				}

				if (Number.isSafeInteger(parseInt(v, 10)) === false) {
					return -1;
				}

				const words = Number(v);

				if ([12, 24].includes(words)) {
					return words;
				}

				return -1;
			},
		)
		.action(async op => {
			try {
				const wds = op.words ?? 12;

				if (wds === -1) {
					console.error(
						chalk.red(
							'The provided words size seems to be incompatible. It must be one of the following values: 12 or 24.',
						),
					);

					return process.exit(1);
				}

				const mnm = op.mnemonic
					? op.mnemonic
					: mnemonic({
							language: 'english',
							strength: wds === 12 ? 128 : 256,
						});

				if (mnm.split(' ').length !== wds) {
					console.error(
						chalk.red(
							'The provided mnemonic seems to be incompatible. Are you sure it is correct?',
						),
					);

					return process.exit(1);
				}

				const key = aes.generateSecret(await seed(mnm), {
					length: op.length === -1 ? undefined : Number(op?.length ?? 32),
					salt: op.salt ? Buffer.from(op.salt) : undefined,
				});

				console.log(chalk.yellow('Mnemonic:'), mnm);

				if (op.abspath === undefined) {
					console.log(chalk.green('Secret key:'), key.toString('base64'));
					return process.exit(0);
				}

				const abspath = parseAbspath(process.cwd(), op.path);

				if (exists(abspath) === false) {
					throw Error(
						`Path "${abspath}" does not exist. Please create it first.`,
					);
				}

				try {
					await fs.writeFile(
						path.join(abspath, op.filename ?? 'encryption.key'),
						key.toString('base64'),
						{ flag: 'wx', mode: 0o600 },
					);

					console.log(
						chalk.green(`Root key saved successfully in "${abspath}"`),
					);
					return process.exit(0);
				} catch (err: any) {
					if (err.code === 'EEXIST') {
						console.warn(
							chalk.yellow(`The root key already exists in "${abspath}".`),
						);

						return process.exit(0);
					}

					console.error(
						chalk.red(
							`Failed to save the root key to "${abspath}": ${err.message}`,
						),
					);

					return process.exit(1);
				}
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}
		});
}
