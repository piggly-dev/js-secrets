import { GenerateKeyPairOptions, GenerateSecretOptions } from '@/types/index.js';
import { keyPairsToFile, secretToFile } from '@/utils/keys.js';
import { mnemonic, seed } from '@/utils/index.js';

import * as ed25519 from './keys/ed25519.js';
import * as aes from './secrets/aes256.js';

export async function generateKeyPair(
	algorithm: string,
	abspath: string,
	key_name: string,
	version: number,
	options: GenerateKeyPairOptions,
	index_name?: string,
): Promise<{
	files: { index?: string; name: string; pk: string; sk: string; version: number };
	mnemonic: string;
}> {
	if (supportsKeyAlgorithm(algorithm) === false) {
		throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const mnm = mnemonic(options.mnemonic);
	const sd = await seed(mnm, options.seed);

	let keys: { pk: Buffer; sk: Buffer };

	switch (algorithm) {
		case 'ed25519':
			keys = ed25519.generateKeyPair(sd);
			break;
		default:
			throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const files = await keyPairsToFile(abspath, key_name, version, keys, index_name);

	return {
		files,
		mnemonic: mnm,
	};
}

export async function generateSecret(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	version: number,
	options: GenerateSecretOptions,
	index_name?: string,
	recover = false,
): Promise<{
	files: { file: string; index?: string; name: string; version: number };
	mnemonic: string;
}> {
	if (supportsEncryptAlgorithm(algorithm) === false) {
		throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const sd = await seed(mnemonic, options.seed);

	let key: Buffer;

	switch (algorithm) {
		case 'aes256':
			key = aes.generateSecret(sd);
			break;
		default:
			throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const files = await secretToFile(
		abspath,
		key_name,
		version,
		key,
		index_name,
		recover,
	);

	return {
		files,
		mnemonic,
	};
}

export async function recoverKeyPair(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	version: number,
	options: Omit<GenerateKeyPairOptions, 'mnemonic'>,
	index_name?: string,
): Promise<{
	files: { index?: string; name: string; pk: string; sk: string; version: number };
	mnemonic: string;
}> {
	if (supportsKeyAlgorithm(algorithm) === false) {
		throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const sd = await seed(mnemonic, options.seed);

	let keys: { pk: Buffer; sk: Buffer };

	switch (algorithm) {
		case 'ed25519':
			keys = ed25519.generateKeyPair(sd);
			break;
		default:
			throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const files = await keyPairsToFile(
		abspath,
		key_name,
		version,
		keys,
		index_name,
		true,
	);

	return {
		files,
		mnemonic,
	};
}

export function supportsEncryptAlgorithm(algorithm: string): boolean {
	return ['aes256'].includes(algorithm);
}

export function supportsKeyAlgorithm(algorithm: string): boolean {
	return ['ed25519'].includes(algorithm);
}
