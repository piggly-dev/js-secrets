import { GenerateKeyPairOptions, GenerateSecretOptions } from '@/types';
import { keyPairsToFile, secretToFile } from '@/utils/keys';
import { mnemonic, seed } from '@/utils';

import * as ed25519 from './keys/ed25519';
import * as aes from './secrets/aes256';

export function supportsKeyAlgorithm(algorithm: string): boolean {
	return ['ed25519'].includes(algorithm);
}

export async function generateKeyPair(
	algorithm: string,
	abspath: string,
	key_name: string,
	version: number,
	options: GenerateKeyPairOptions,
	index_name?: string
): Promise<{
	mnemonic: string;
	files: { sk: string; pk: string; name: string; version: number; index?: string };
}> {
	if (supportsKeyAlgorithm(algorithm) === false) {
		throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const mnm = mnemonic(options.mnemonic);
	const sd = await seed(mnm, options.seed);

	let keys: { sk: Buffer; pk: Buffer };

	switch (algorithm) {
		case 'ed25519':
			keys = ed25519.generateKeyPair(sd);
			break;
		default:
			throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const files = await keyPairsToFile(abspath, key_name, version, keys, index_name);

	return {
		mnemonic: mnm,
		files,
	};
}

export async function recoverKeyPair(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	version: number,
	options: Omit<GenerateKeyPairOptions, 'mnemonic'>,
	index_name?: string
): Promise<{
	mnemonic: string;
	files: { sk: string; pk: string; name: string; version: number; index?: string };
}> {
	if (supportsKeyAlgorithm(algorithm) === false) {
		throw Error(`Algorithm ${algorithm} not supported.`);
	}

	const sd = await seed(mnemonic, options.seed);

	let keys: { sk: Buffer; pk: Buffer };

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
		true
	);

	return {
		mnemonic,
		files,
	};
}

export function supportsEncryptAlgorithm(algorithm: string): boolean {
	return ['aes256'].includes(algorithm);
}

export async function generateSecret(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	version: number,
	options: GenerateSecretOptions,
	index_name?: string,
	recover = false
): Promise<{
	mnemonic: string;
	files: { file: string; name: string; version: number; index?: string };
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
		recover
	);

	return {
		mnemonic,
		files,
	};
}
