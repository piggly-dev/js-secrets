import crypto from 'node:crypto';
import path from 'node:path';

import { generateMnemonic, mnemonicToSeed, wordlists } from 'bip39';

import {
	GenerateMnemonicSeedOptions,
	GenerateMnemonicOptions,
} from '@/types/index.js';

/**
 * Convert a buffer to a hex string.
 *
 * @param buffer - The buffer to convert.
 * @returns The hex string.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function bufferToHex(buffer: Buffer) {
	return buffer.toString('hex');
}

/**
 * Convert a buffer to a string.
 *
 * @param buffer - The buffer to convert.
 * @returns The string.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function bufferToString(buffer: Buffer) {
	return buffer.toString();
}

/**
 * Cut a buffer to a specified length.
 *
 * @param buffer - The buffer to cut.
 * @param length - The length to cut the buffer to.
 * @returns The cut buffer.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function cutBuffer(buffer: Buffer, length: number): Buffer {
	return buffer.subarray(0, length);
}

/**
 * Generate a hash from a message.
 *
 * @param algorithm - The algorithm to use.
 * @param message - The message to hash.
 * @returns The hash.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function hash(algorithm: string, message: string): Buffer {
	return crypto.createHash(algorithm).update(message).digest();
}

/**
 * Generate a mnemonic.
 *
 * @param options - The options to generate the mnemonic.
 * @returns The mnemonic.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
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

/**
 * Parse a path.
 *
 * @param root - The root path.
 * @param abspath - The path to parse.
 * @returns The parsed path.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function parseAbspath(root: string, abspath?: string): string {
	if (abspath) {
		if (abspath.startsWith('/') === false) {
			return path.join(root, abspath);
		}

		return abspath;
	}

	return root;
}

/**
 * Parse a file name.
 *
 * @param file - The file name to parse.
 * @returns The parsed file name.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
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

/**
 * Generate a seed from a mnemonic.
 *
 * @param mnemonic - The mnemonic to generate the seed from.
 * @param options - The options to generate the seed.
 * @returns The seed.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function seed(
	mnemonic: string,
	options: GenerateMnemonicSeedOptions = {},
): Promise<Buffer> {
	return mnemonicToSeed(mnemonic, options.password);
}

/**
 * Split a string into chunks of words.
 *
 * @param input - The string to split.
 * @param chunkSize - The size of the chunks.
 * @returns The chunks.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function splitWords(input: string, chunkSize = 6): Array<Array<string>> {
	const words = input.split(' ');
	const result: string[][] = [];

	for (let i = 0; i < words.length; i += chunkSize) {
		const chunk = words.slice(i, i + chunkSize);
		result.push(chunk);
	}

	return result;
}

/**
 * Convert a string to a buffer.
 *
 * @param message - The string to convert.
 * @returns The buffer.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function stringToBuffer(message: string) {
	return Buffer.from(message);
}

/**
 * Check if a mnemonic language is supported.
 *
 * @param language - The language to check.
 * @returns True if the language is supported, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function supportsMnemonicLanguage(language: string): boolean {
	return Object.keys(wordlists).includes(language);
}
