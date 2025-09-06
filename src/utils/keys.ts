import path from 'node:path';

import { createPath, removeFile, writeFile, exists } from '@/utils/file.js';
import { versionExists, readAll, write } from '@/utils/indexes.js';
import { VersionedKeyPair, VersionedKey } from '@/types/index.js';

export async function keyPairsToFile(
	abspath: string,
	name: string,
	version: number,
	key: { pk: Buffer; sk: Buffer },
	index_name?: string,
	replace = false,
): Promise<{
	index?: string;
	name: string;
	pk: string;
	sk: string;
	version: number;
}> {
	const sk_file = path.join(abspath, `${name}.sk.key`);
	const pk_file = path.join(abspath, `${name}.pk.key`);

	const indexable = !!(index_name && index_name.length > 0);

	createPath(abspath);

	if (exists(sk_file) || exists(pk_file)) {
		if (replace === false) {
			throw Error(`Key ${name} already exists.`);
		}

		await removeFile(sk_file);
		await removeFile(pk_file);
	}

	let indexes: Array<VersionedKeyPair> = [];

	if (indexable) {
		indexes = await readAll<VersionedKeyPair>('keypairs', abspath, index_name);

		if (versionExists(indexes, version) === true) {
			throw Error(`Version ${version} already exists.`);
		}
	}

	await writeFile(sk_file, key.sk);
	await writeFile(pk_file, key.pk);

	if (indexable === false) {
		return { name, pk: pk_file, sk: sk_file, version };
	}

	indexes.push({ name, pk: pk_file, sk: sk_file, version });
	const indexed = await write('keypairs', abspath, index_name as string, indexes);

	return { index: indexed, name, pk: pk_file, sk: sk_file, version };
}

export async function secretToFile(
	abspath: string,
	name: string,
	version: number,
	secret: Buffer,
	index_name?: string,
	replace = false,
): Promise<{ file: string; index?: string; name: string; version: number }> {
	const key_file = path.join(abspath, `${name}.secret.key`);
	const indexable = !!(index_name && index_name.length > 0);

	createPath(abspath);

	if (exists(key_file)) {
		if (replace === false) {
			throw Error(`Key ${name} already exists.`);
		}

		await removeFile(key_file);
	}

	let indexes: Array<VersionedKey> = [];

	if (indexable) {
		indexes = await readAll<VersionedKey>('secrets', abspath, index_name);

		if (versionExists(indexes, version) === true) {
			throw Error(`Version ${version} already exists.`);
		}
	}

	await writeFile(key_file, secret);

	if (indexable === false) {
		return { file: key_file, name, version };
	}

	indexes.push({ file: key_file, name, version });
	const indexed = await write('secrets', abspath, index_name as string, indexes);

	return { file: key_file, index: indexed, name, version };
}
