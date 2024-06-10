import { wordlists, mnemonicToSeed, generateMnemonic } from 'bip39';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import crypto from 'crypto';
import path from 'path';

import { GenerateMnemonicOptions, GenerateMnemonicSeedOptions } from '@/types';

export function supportsMnemonicLanguage(language: string): boolean {
	return Object.keys(wordlists).includes(language);
}

export function mnemonic(options: GenerateMnemonicOptions = {}): string {
	let wordslist: Array<string> | undefined;

	if (options.language) {
		if (supportsMnemonicLanguage(options.language) === false) {
			throw Error(`Language ${options.language} not supported.`);
		}

		wordslist = wordlists[options.language];
	}

	return generateMnemonic(options.strength, options.rng, wordslist);
}

export async function seed(
	mnemonic: string,
	options: GenerateMnemonicSeedOptions = {}
): Promise<Buffer> {
	return mnemonicToSeed(mnemonic, options.password);
}

export function hash(algorithm: string, message: string): Buffer {
	return crypto.createHash(algorithm).update(message).digest();
}

export function cutBuffer(buffer: Buffer, length: number): Buffer {
	return buffer.subarray(0, length);
}

export function bufferToHex(buffer: Buffer) {
	return buffer.toString('hex');
}

export function bufferToString(buffer: Buffer) {
	return buffer.toString();
}

export function stringToBuffer(message: string) {
	return Buffer.from(message);
}

export function splitWords(input: string, chunkSize = 6): Array<Array<string>> {
	const words = input.split(' ');
	const result: string[][] = [];

	for (let i = 0; i < words.length; i += chunkSize) {
		const chunk = words.slice(i, i + chunkSize);
		result.push(chunk);
	}

	return result;
}

export function parseFileName(file: string): string {
	return slugify(file, {
		replacement: '_',
		remove: /[^a-zA-Z0-9]/g,
		lower: true,
		strict: true,
	});
}

export function parseAbspath(abspath?: string): string {
	if (abspath && abspath.startsWith('/') === false) {
		throw new Error('Path is required and must be absolute.');
	}

	return (
		abspath ??
		path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'keys')
	);
}
