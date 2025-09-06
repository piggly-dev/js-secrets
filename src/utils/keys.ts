import path from 'node:path';

import { createPath, removeFile, writeFile, exists } from '@/utils/file.js';
import { versionExists, readAll, write } from '@/utils/indexes.js';
import { VersionedKeyPair, VersionedKey } from '@/types/index.js';
import { publicToPem, secretToPem } from '@/core/keys/ed25519.js';

/**
 * Write a key pair to a file.
 *
 * @param abspath - The path to write the key pair to.
 * @param name - The name of the key pair.
 * @param version - The version of the key pair.
 * @param key - The key pair to write.
 * @param index_name - The name of the index to write the key pair to.
 * @param replace - Whether to replace the key pair if it already exists.
 * @returns The key pair.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function keyPairsToFile(
	abspath: string,
	name: string,
	key: { pk: Buffer; sk: Buffer },
	options?: Partial<{
		format: 'pem' | 'raw';
		index_name: string;
		replace: boolean;
		version: number;
	}>,
): Promise<{
	index?: string;
	name: string;
	pk: string;
	sk: string;
	version?: number;
}> {
	const sk_file = path.join(
		abspath,
		options?.version ? `${name}.v${options.version}.sk.key` : `${name}.sk.key`,
	);

	const pk_file = path.join(
		abspath,
		options?.version ? `${name}.v${options.version}.pk.key` : `${name}.pk.key`,
	);

	const indexable =
		!!(options?.index_name && options?.index_name.length > 0) &&
		!!options?.version;

	createPath(abspath);

	if (exists(sk_file) || exists(pk_file)) {
		if (options?.replace === false) {
			throw Error(`Key ${name} already exists.`);
		}

		await removeFile(sk_file);
		await removeFile(pk_file);
	}

	let indexes: Array<VersionedKeyPair> = [];

	if (indexable) {
		indexes = await readAll<VersionedKeyPair>(
			'keypairs',
			abspath,
			options.index_name!,
		);

		if (versionExists(indexes, options.version!) === true) {
			throw Error(`Version ${options.version!} already exists.`);
		}
	}

	await writeFile(
		sk_file,
		options?.format === 'pem' ? secretToPem(key.sk) : key.sk,
	);

	await writeFile(
		pk_file,
		options?.format === 'pem' ? publicToPem(key.pk) : key.pk,
	);

	if (indexable === false) {
		return { name, pk: pk_file, sk: sk_file, version: options?.version ?? 1 };
	}

	indexes.push({ name, pk: pk_file, sk: sk_file, version: options.version! });
	const indexed = await write('keypairs', abspath, options.index_name!, indexes);

	return {
		index: indexed,
		name,
		pk: pk_file,
		sk: sk_file,
		version: options.version!,
	};
}

/**
 * Write a secret to a file.
 *
 * @param abspath - The path to write the secret to.
 * @param name - The name of the secret.
 * @param version - The version of the secret.
 * @param secret - The secret to write.
 * @param index_name - The name of the index to write the secret to.
 * @param replace - Whether to replace the secret if it already exists.
 * @returns The secret.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function secretToFile(
	abspath: string,
	name: string,
	secret: Buffer,
	options?: Partial<{
		index_name: string;
		replace: boolean;
		version: number;
	}>,
): Promise<{ file: string; index?: string; name: string; version?: number }> {
	const key_file = path.join(
		abspath,
		options?.version
			? `${name}.v${options.version}.secret.key`
			: `${name}.secret.key`,
	);
	const indexable =
		!!(options?.index_name && options?.index_name.length > 0) &&
		!!options?.version;

	createPath(abspath);

	if (exists(key_file)) {
		if (options?.replace === false) {
			throw Error(`Key ${name} already exists.`);
		}

		await removeFile(key_file);
	}

	let indexes: Array<VersionedKey> = [];

	if (indexable) {
		indexes = await readAll<VersionedKey>('secrets', abspath, options.index_name!);

		if (versionExists(indexes, options.version!) === true) {
			throw Error(`Version ${options.version!} already exists.`);
		}
	}

	await writeFile(key_file, secret);

	if (indexable === false) {
		return { file: key_file, name, version: options?.version ?? 1 };
	}

	indexes.push({ file: key_file, name, version: options.version! });
	const indexed = await write('secrets', abspath, options.index_name!, indexes);

	return { file: key_file, index: indexed, name, version: options.version! };
}
