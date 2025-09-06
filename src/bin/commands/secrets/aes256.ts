/* eslint-disable no-console */
import { Command } from 'commander';
import chalk from 'chalk';

import { parseFileName, parseAbspath, mnemonic } from '@/utils/index.js';
import { generateSecret } from '@/core/index.js';
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
			'Language of mnemonic. Available: czech, chinese_simplified, chinese_traditional, korean, french, italian, spanish, japanese, portuguese, english. Default is english.',
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
