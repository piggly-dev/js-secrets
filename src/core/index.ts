import { GenerateKeyPairOptions, GenerateSecretOptions } from '@/types/index.js';
import { keyPairsToFile, secretToFile } from '@/utils/keys.js';
import { mnemonic, seed } from '@/utils/index.js';
import * as ed25519 from '@/core/keys/ed25519.js';
import * as aes from '@/core/secrets/aes256.js';

/**
 * Generate a key pair.
 *
 * @param algorithm - The algorithm to use.
 * @param abspath - The path to save the key pair.
 * @param key_name - The name of the key pair.
 * @param options - The options to generate the key pair.
 * @returns The key pair.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function generateKeyPair(
	algorithm: string,
	abspath: string,
	key_name: string,
	options: GenerateKeyPairOptions,
): Promise<{
	files: { index?: string; name: string; pk: string; sk: string; version?: number };
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

	const files = await keyPairsToFile(abspath, key_name, keys, options);

	return {
		files,
		mnemonic: mnm,
	};
}

/**
 * Generate a secret.
 *
 * @param algorithm - The algorithm to use.
 * @param mnemonic - The mnemonic to use.
 * @param abspath - The path to save the secret.
 * @param key_name - The name of the key.
 * @param options - The options to generate the secret.
 * @returns The secret.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function generateSecret(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	options: GenerateSecretOptions,
): Promise<{
	files: { file: string; index?: string; name: string; version?: number };
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

	const files = await secretToFile(abspath, key_name, key, options);

	return {
		files,
		mnemonic,
	};
}

/**
 * Recover a key pair.
 *
 * @param algorithm - The algorithm to use.
 * @param mnemonic
 * @param abspath
 * @param key_name - The name of the key.
 * @param options - The options to recover the key.
 * @returns The key.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function recoverKeyPair(
	algorithm: string,
	mnemonic: string,
	abspath: string,
	key_name: string,
	options: Omit<GenerateKeyPairOptions, 'mnemonic'>,
): Promise<{
	files: { index?: string; name: string; pk: string; sk: string; version?: number };
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

	const files = await keyPairsToFile(abspath, key_name, keys, {
		...options,
		replace: true,
	});

	return {
		files,
		mnemonic,
	};
}

/**
 * Check if the algorithm is supported for encryption.
 *
 * @param algorithm - The algorithm to check.
 * @returns True if the algorithm is supported, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function supportsEncryptAlgorithm(algorithm: string): boolean {
	return ['aes256'].includes(algorithm);
}

/**
 * Check if the algorithm is supported for key generation.
 *
 * @param algorithm - The algorithm to check.
 * @returns True if the algorithm is supported, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function supportsKeyAlgorithm(algorithm: string): boolean {
	return ['ed25519'].includes(algorithm);
}
