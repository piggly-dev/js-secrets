import { Command } from 'commander';
import chalk from 'chalk';

import { mnemonic, parseAbspath, parseFileName } from '@/utils';
import { remove } from '@/utils/indexes';
import { generateSecret } from '@/core';

export function generateAES256SecretCommand(program: Command) {
	program
		.command('generate:aes256')
		.description(
			'Generates a secret based on a mnemonic phrase. It should be used with aes256 algorithm.'
		)
		.argument('<name>', 'Name of the key.')
		.argument('<version>', 'Version of the key. Should be an integer.')
		.option('-p, --path <path>', 'Path to save the key.')
		.option(
			'-x, --index <index>',
			'Index name. Will store the key in a JSON index.'
		)
		.option('-w, --password <password>', 'Password for seed generation.')
		.option('-l, --language <language>', 'Language of mnemonic.', 'english')
		.action(async (n, v, op) => {
			try {
				const version = parseInt(v, 10);
				const key_name = parseFileName(n);
				const index_name = op.index ? parseFileName(op.index) : undefined;
				const abspath = parseAbspath(op.path);

				const generated = await generateSecret(
					'aes256',
					abspath,
					mnemonic({
						strength: parseInt(op.strength, 10),
						language: op.language,
					}),
					key_name,
					version,
					{
						seed: {
							password: op.password,
						},
					},
					index_name
				);

				console.log(
					chalk.green('Secret key generated at:'),
					generated.files.file
				);

				if (generated.files.index) {
					console.log(
						chalk.green('Secret key indexed at:'),
						generated.files.index
					);
				}

				console.log(chalk.green('Mnemonic:'), generated.mnemonic, '\n');

				console.log(
					chalk.yellow(
						'Keep the mnemonic safe! It can be used to recover the key pair.'
					)
				);
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}

			return process.exit(0);
		});
}

export function recoverAES256SecretCommand(program: Command) {
	program
		.command('recover:aes256')
		.description(
			'Recovers a key-pair from a mnemonic and save it to a file. It will remove the previous key from index when index is set.'
		)
		.argument('<name>', 'Name of the key.')
		.argument('<version>', 'Version of the key. Should be an integer.')
		.option('-p, --path <path>', 'Path to save the key.')
		.option(
			'-x, --index <index>',
			'Index name. Will store the key in a JSON index.'
		)
		.option('-m, --mnemonic <mnemonic>', 'Mnemonic to recover the key.')
		.option('-w, --password <password>', 'Password for seed generation.')
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
					await remove('keypairs', abspath, index_name, version);
				}

				const generated = await generateSecret(
					'aes256',
					mnemonic,
					abspath,
					key_name,
					version,
					{
						seed: {
							password: op.password,
						},
					},
					index_name,
					true
				);

				console.log(
					chalk.green('Secret key recovered at:'),
					generated.files.file
				);

				if (generated.files.index) {
					console.log(
						chalk.green('Secret key reindexed at:'),
						generated.files.index
					);
				}

				console.log(chalk.green('Mnemonic:'), generated.mnemonic, '\n');

				console.log(
					chalk.yellow(
						'Keep the mnemonic safe! It can be used again to recover the key pair.'
					)
				);
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}

			return process.exit(0);
		});
}
