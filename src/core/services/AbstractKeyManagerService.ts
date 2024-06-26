import path from 'path';
import fs from 'fs';

import type { IKeyManagerService, VersionedKey } from '@/types';

import { readAll } from '@/utils/indexes';

export abstract class AbstractKeyManagerService<KeyType = Buffer>
	implements IKeyManagerService<KeyType>
{
	protected _name: string;

	protected _secrets: Map<number, KeyType>;

	protected _current_version: number;

	protected _path: string;

	constructor(name: string, abspath: string, current_version?: number) {
		this._secrets = new Map();
		this._name = name;
		this._path = abspath;
		this._current_version = current_version ?? 1;
	}

	public get raw(): Map<number, KeyType> {
		return this._secrets;
	}

	public async load(index_name?: string): Promise<true> {
		if (index_name) {
			const index = await readAll<VersionedKey>(
				'secrets',
				this._path,
				index_name
			);

			index.forEach(i => {
				this._secrets.set(i.version, fs.readFileSync(i.file) as KeyType);
			});

			return true;
		}

		const secret = fs.readFileSync(
			path.join(this._path, `${this._name}.secret.key`)
		) as KeyType;

		this._secrets.set(this._current_version, secret);
		return true;
	}

	public get(version?: number): KeyType {
		const v = version ?? this._current_version;

		if (this._secrets.has(v) === false) {
			throw Error(`Key/secret version ${v} not found for ${this._name}.`);
		}

		return this._secrets.get(v) as KeyType;
	}

	public get name(): string {
		return this._name;
	}

	public get current_version(): number {
		return this._current_version;
	}
}
