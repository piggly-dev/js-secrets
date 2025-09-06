import path from 'node:path';

import { VersionedKeyPair, VersionedKey } from '@/types/index.js';
import { writeFile, readFile } from '@/utils/file.js';

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

export function versionExists(
	indexes: Array<{ version: number }>,
	version: number,
): boolean {
	return indexes.some(v => v.version === version);
}

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
