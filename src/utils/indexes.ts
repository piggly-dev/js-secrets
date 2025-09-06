import path from 'node:path';

import { VersionedKeyPair, VersionedKey } from '@/types/index.js';
import { writeFile, readFile } from '@/utils/file.js';

/**
 * Read all indexes from a file.
 *
 * @param type - The type of the index.
 * @param abspath - The path to read the indexes from.
 * @param index_name - The name of the index to read.
 * @returns The indexes.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function readAll<Index = VersionedKey>(
	type: 'keypairs' | 'secrets',
	abspath: string,
	index_name: string,
): Promise<Array<Index>> {
	const indexes: Array<Index> = [];

	try {
		const data = await readFile(
			path.join(abspath, `${index_name}.index.${type}.json`),
		);

		const parsed: Array<Index> = JSON.parse(data.toString());
		parsed.forEach(v => indexes.push(v));
	} catch {
		// do nothing
	}

	return indexes;
}

/**
 * Read a key from an index.
 *
 * @param type - The type of the index.
 * @param abspath - The path to read the index from.
 * @param index_name - The name of the index to read.
 * @param version - The version of the key to read.
 * @returns The key.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function readKey<Index extends { version: number }>(
	type: 'keypairs' | 'secrets',
	abspath: string,
	index_name: string,
	version: number,
): Promise<undefined | Index> {
	const indexes = await readAll<Index>(type, abspath, index_name);
	const key = indexes.find(v => v.version === version);

	if (!key) {
		throw Error(`Version ${version} not found.`);
	}

	return key;
}

/**
 * Remove a key from an index.
 *
 * @param type - The type of the index.
 * @param abspath - The path to remove the key from.
 * @param index_name - The name of the index to remove the key from.
 * @param version - The version of the key to remove.
 * @returns The key.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function remove(
	type: 'keypairs' | 'secrets',
	abspath: string,
	index_name: string,
	version: number,
): Promise<string> {
	const indexes = await readAll<{ version: number }>(type, abspath, index_name);

	if (indexes.length === 0) {
		throw Error('Index is empty.');
	}

	const key = indexes.find(v => v.version === version);

	if (!key) {
		throw Error(`Version ${version} not found.`);
	}

	const updated: Array<any> = indexes.filter(v => v.version !== version);
	return write(type, abspath, index_name, updated);
}

/**
 * Check if a version exists in an index.
 *
 * @param indexes - The indexes to check.
 * @param version - The version to check.
 * @returns True if the version exists, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function versionExists(
	indexes: Array<{ version: number }>,
	version: number,
): boolean {
	return indexes.some(v => v.version === version);
}

/**
 * Write an index to a file.
 *
 * @param type - The type of the index.
 * @param abspath - The path to write the index to.
 * @param index_name - The name of the index to write.
 * @param indexes - The indexes to write.
 * @returns The index.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function write(
	type: 'keypairs' | 'secrets',
	abspath: string,
	index_name: string,
	indexes: Array<VersionedKeyPair | VersionedKey> = [],
): Promise<string> {
	return writeFile(
		path.join(abspath, `${index_name}.index.${type}.json`),
		JSON.stringify(indexes),
	);
}
