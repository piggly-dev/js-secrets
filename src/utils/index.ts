import { wordlists, mnemonicToSeed, generateMnemonic } from 'bip39';
import { pbkdf2, randomBytes, scrypt } from 'crypto';
import { join as joinPath } from 'path';
import bcrypt from 'bcrypt';
import fs from 'fs';

import {
	GenerateKeyWithBcryptOptions,
	GenerateKeyWithPBKDF2Options,
	GenerateKeyWithScryptOptions,
	GenerateMnemonicOptions,
	GenerateMnemonicSeedOptions,
	VersionedKey,
} from '@/types';

export function mnemonic(options: GenerateMnemonicOptions = {}): string {
	let wordslist: Array<string> | undefined;

	if (options.language) {
		wordslist = wordlists[options.language];
	}

	return generateMnemonic(options.strength, options.rng, wordslist);
}

export async function seed(
	mnemonic: string,
	options: GenerateMnemonicSeedOptions
): Promise<Buffer> {
	return mnemonicToSeed(mnemonic, options.password);
}

export async function generateKeyWithPBKDF2(
	seed: Buffer,
	options: GenerateKeyWithPBKDF2Options = {}
): Promise<Buffer> {
	if (options.salt_length && options.salt_length < 16) {
		throw Error('Salt key must be more than 16 length.');
	}

	return new Promise((res, rej) => {
		pbkdf2(
			seed,
			randomBytes(options.salt_length ?? 16),
			options.iterations ?? 10000,
			options.key_length ?? 32,
			'sha256',
			(err, derivedKey) => {
				if (err) {
					return rej(err);
				}

				return res(derivedKey);
			}
		);
	});
}

export async function generateKeyWithBcrypt(
	seed: Buffer,
	options: GenerateKeyWithBcryptOptions
): Promise<Buffer> {
	if (options.salt_length && options.salt_length < 16) {
		throw Error('Salt key must be more than 16 length.');
	}

	return new Promise((res, rej) => {
		bcrypt.hash(seed, options.salt_length ?? 16, (err, derivedKey) => {
			if (err) {
				return rej(err);
			}

			return res(Buffer.from(derivedKey));
		});
	});
}

export async function generateKeyWithScrypt(
	seed: Buffer,
	options: GenerateKeyWithScryptOptions
): Promise<Buffer> {
	if (options.salt_length && options.salt_length < 16) {
		throw Error('Salt key must be more than 16 length.');
	}

	return new Promise((res, rej) => {
		scrypt(
			seed,
			randomBytes(options.salt_length ?? 16),
			options.key_length ?? 32,
			{
				N: options.cost ?? 16384,
				r: options.block_size ?? 8,
				p: options.parallelization ?? 1,
			},
			(err, derivedKey) => {
				if (err) {
					return rej(err);
				}

				return res(derivedKey);
			}
		);
	});
}

export async function writeKeyIndexes(
	abspath: string,
	index_name: string,
	indexes: Array<VersionedKey>
): Promise<void> {
	const idx_file = joinPath(abspath, `${index_name}.index.json`);

	return new Promise<void>((res, rej) => {
		fs.writeFile(idx_file, JSON.stringify(indexes), err => {
			if (err) {
				return rej(err);
			}

			return res();
		});
	});
}

export async function readKeyIndexes(
	abspath: string,
	index_name: string
): Promise<Array<VersionedKey>> {
	const idx_file = joinPath(abspath, `${index_name}.index.json`);
	const indexes: Array<VersionedKey> = [];

	await new Promise<void>((res, rej) => {
		fs.readFile(idx_file, (err, data) => {
			if (err) {
				return res();
			}

			if (data && data.length !== 0) {
				try {
					const parsed: Array<VersionedKey> = JSON.parse(data.toString());

					parsed.forEach(v => indexes.push(v));
					return res();
				} catch (e: any) {
					return rej(e);
				}
			}

			return res();
		});
	});

	return indexes;
}

export function versionExists(
	indexes: Array<VersionedKey>,
	version: number
): boolean {
	return indexes.some(v => v.version === version);
}

export async function readKeyFromIndex(
	abspath: string,
	index_name: string,
	version: number
): Promise<Buffer> {
	const indexes = await readKeyIndexes(abspath, index_name);
	const key = indexes.find(v => v.version === version);

	if (!key) {
		throw Error(`Version ${version} not found.`);
	}

	return new Promise<Buffer>((res, rej) => {
		fs.readFile(key.file, (err, data) => {
			if (err) {
				return rej(err);
			}

			return res(data);
		});
	});
}

export async function readKeyFromFile(
	abspath: string,
	name: string
): Promise<Buffer> {
	const key_file = joinPath(abspath, `${name}.key`);

	return new Promise<Buffer>((res, rej) => {
		fs.readFile(key_file, (err, data) => {
			if (err) {
				return rej(err);
			}

			return res(data);
		});
	});
}

export async function bufferToFile(
	abspath: string,
	name: string,
	version: number,
	buffer: Buffer,
	index_name?: string
): Promise<void> {
	const key_file = joinPath(abspath, `${name}.key`);
	const indexable = index_name && index_name.length > 0;

	if (fs.existsSync(abspath) === false) {
		fs.mkdirSync(abspath);
	}

	let indexes: Array<VersionedKey> = [];

	if (index_name && index_name.length > 0) {
		indexes = await readKeyIndexes(abspath, index_name);

		if (versionExists(indexes, version) === true) {
			throw Error(`Version ${version} already exists.`);
		}
	}

	return new Promise<void>((res, rej) => {
		// eslint-disable-next-line consistent-return
		fs.writeFile(key_file, buffer, err => {
			if (err) {
				return rej(err);
			}

			if (indexable === false) {
				return res();
			}

			indexes.push({ file: key_file, name, version });
			writeKeyIndexes(abspath, index_name as string, indexes)
				.then(res)
				.catch(rej);
		});
	});
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
// export const generateKeyFromSeed = (
// 	seed: Buffer,
// 	options: GenerateKeyFromSeedOptions
// ) => createHash(algorithm).update(seed).digest('hex');
