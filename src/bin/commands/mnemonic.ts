import { Command } from 'commander';
import chalk from 'chalk';

import { mnemonic, splitWords } from '@/utils';

export function generateMnemonic(program: Command) {
	program
		.command('mnemonic')
		.description('Generates and show a mnemonic.')
		.option('-s, --strength <strength>', 'Strength of mnemonic.', '128')
		.option(
			'-n, --language <language>',
			'Language of mnemonic. Available: czech, chinese_simplified, chinese_traditional, korean, french, italian, spanish, japanese, portuguese, english.',
			'english'
		)
		.action(options => {
			console.log(chalk.yellow('Mnemonic'));

			try {
				const list = splitWords(
					mnemonic({
						strength: options.strength
							? parseInt(options.strength, 10)
							: undefined,
						language: options.language,
					})
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
