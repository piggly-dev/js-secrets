import path from 'path';
import fs from 'fs';

import { readAll } from '@/utils/indexes';
import { VersionedKey } from '@/types';

export class SecretManagerService {
	private _secrets: Map<string, Map<number, Buffer>>;

	private _current_version: number;

	private _path: string;

	constructor(abspath: string, current_version?: number) {
		this._secrets = new Map();
		this._path = abspath;
		this._current_version = current_version ?? 1;
	}

	public get raw(): Map<string, Map<number, Buffer>> {
		return this._secrets;
	}

	public async load(name: string, index_name?: string): Promise<true> {
		if (this._secrets.has(name)) {
			this._secrets.delete(name);
		}

		const secrets = new Map<number, Buffer>();

		if (index_name) {
			const index = await readAll<VersionedKey>(
				'secrets',
				this._path,
				index_name
			);

			index.forEach(i => {
				secrets.set(i.version, fs.readFileSync(i.file));
			});

			this._secrets.set(name, secrets);
			return true;
		}

		const secret = fs.readFileSync(path.join(this._path, `${name}.secret.key`));
		secrets.set(1, secret);

		this._secrets.set(name, secrets);
		return true;
	}

	public async get(name: string, version?: number): Promise<Buffer> {
		if (this._secrets.has(name) === false) {
			throw Error(`Secret ${name} not found.`);
		}

		const secret = this._secrets.get(name) as Map<number, Buffer>;
		const v = version ?? this._current_version;

		if (secret.has(v) === false) {
			throw Error(`Secret ${name} version ${v} not found.`);
		}

		return secret.get(v) as Buffer;
	}
}
