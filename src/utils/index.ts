import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import path from 'node:path';

import { generateMnemonic, mnemonicToSeed, wordlists } from 'bip39';

import {
	GenerateMnemonicSeedOptions,
	GenerateMnemonicOptions,
} from '@/types/index.js';

export function bufferToHex(buffer: Buffer) {
	return buffer.toString('hex');
}

export function bufferToString(buffer: Buffer) {
	return buffer.toString();
}

export function cutBuffer(buffer: Buffer, length: number): Buffer {
	return buffer.subarray(0, length);
}

export function hash(algorithm: string, message: string): Buffer {
	return crypto.createHash(algorithm).update(message).digest();
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

export function parseAbspath(abspath?: string): string {
	if (abspath && abspath.startsWith('/') === false) {
		throw new Error('Path is required and must be absolute.');
	}

	return (
		abspath ??
		path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'keys')
	);
}

export function parseFileName(file: string): string {
	const [_filename] = file.split('.');

	return _filename
		.trim()
		.toLowerCase()
		.replace(/[\W\s]/gi, '_')
		.replace(/_+/g, '_')
		.replace(/^_+/, '')
		.replace(/_+$/, '');
}

export async function seed(
	mnemonic: string,
	options: GenerateMnemonicSeedOptions = {},
): Promise<Buffer> {
	return mnemonicToSeed(mnemonic, options.password);
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

export function stringToBuffer(message: string) {
	return Buffer.from(message);
}

export function supportsMnemonicLanguage(language: string): boolean {
	return Object.keys(wordlists).includes(language);
}
