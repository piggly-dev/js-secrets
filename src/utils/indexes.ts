import path from 'path';

import { VersionedKey, VersionedKeyPair } from '@/types';
import { readFile, writeFile } from '@/utils/file';

export async function write(
	type: 'secrets' | 'keypairs',
	abspath: string,
	index_name: string,
	indexes: Array<VersionedKey | VersionedKeyPair> = []
): Promise<string> {
	return writeFile(
		path.join(abspath, `${index_name}.index.${type}.json`),
		JSON.stringify(indexes)
	);
}

export async function readAll<Index = VersionedKey>(
	type: 'secrets' | 'keypairs',
	abspath: string,
	index_name: string
): Promise<Array<Index>> {
	const indexes: Array<Index> = [];

	try {
		const data = await readFile(
			path.join(abspath, `${index_name}.index.${type}.json`)
		);

		const parsed: Array<Index> = JSON.parse(data.toString());
		parsed.forEach(v => indexes.push(v));
	} catch (err) {
		// do nothing
	}

	return indexes;
}

export async function readKey<Index extends { version: number }>(
	type: 'secrets' | 'keypairs',
	abspath: string,
	index_name: string,
	version: number
): Promise<Index | undefined> {
	const indexes = await readAll<Index>(type, abspath, index_name);
	const key = indexes.find(v => v.version === version);

	if (!key) {
		throw Error(`Version ${version} not found.`);
	}

	return key;
}

export async function remove(
	type: 'secrets' | 'keypairs',
	abspath: string,
	index_name: string,
	version: number
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
	version: number
): boolean {
	return indexes.some(v => v.version === version);
}
