/* eslint-disable no-console */
import { Command } from 'commander';
import chalk from 'chalk';

import { splitWords, mnemonic } from '@/utils/index.js';

/**
 * Generate a mnemonic.
 *
 * @param program - The program to add the command to.
 * @returns The program.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateMnemonic(program: Command) {
	program
		.command('mnemonic')
		.description('Generates and show a mnemonic.')
		.option(
			'-s, --strength <strength>',
			'Strength of mnemonic. Default is 128.',
			'128',
		)
		.option(
			'-l, --language <language>',
			'Language of mnemonic. Available: czech, chinese_simplified, chinese_traditional, korean, french, italian, spanish, japanese, portuguese, english.',
			'english',
		)
		.action(options => {
			console.log(chalk.yellow('Mnemonic'));

			try {
				const list = splitWords(
					mnemonic({
						language: options.language,
						strength: options.strength
							? parseInt(options.strength, 10)
							: undefined,
					}),
				);

				console.log();

				list.forEach(word => {
					console.log(chalk.green(`${word.join(' ')}`));
				});
			} catch (error: any) {
				console.error(chalk.red(error.message));
				return process.exit(1);
			}

			return process.exit(0);
		});
}
