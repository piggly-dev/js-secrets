import path from 'path';
import fs from 'fs';

import { VersionedKeyPair } from '@/types';
import { readAll } from '@/utils/indexes';

export class KeyPairManagerService {
	private _keypairs: Map<string, Map<number, { sk: Buffer; pk: Buffer }>>;

	private _path: string;

	constructor(abspath: string) {
		this._keypairs = new Map();
		this._path = abspath;
	}

	public async load(name: string, index_name?: string): Promise<true> {
		if (this._keypairs.has(name)) {
			this._keypairs.delete(name);
		}

		const keypairs = new Map<number, { sk: Buffer; pk: Buffer }>();

		if (index_name) {
			const index = await readAll<VersionedKeyPair>(
				'keypairs',
				this._path,
				index_name
			);

			index.forEach(i => {
				keypairs.set(i.version, {
					sk: fs.readFileSync(i.sk),
					pk: fs.readFileSync(i.pk),
				});
			});

			return true;
		}

		const sk = fs.readFileSync(path.join(this._path, `${name}.sk.key`));
		const pk = fs.readFileSync(path.join(this._path, `${name}.pk.key`));

		keypairs.set(0, { sk, pk });
		this._keypairs.set(name, keypairs);
		return true;
	}

	public async get(
		name: string,
		version?: number
	): Promise<{ sk: Buffer; pk: Buffer }> {
		if (this._keypairs.has(name) === false) {
			throw Error(`Key-pair ${name} not found.`);
		}

		const keypair = this._keypairs.get(name) as Map<
			number,
			{ sk: Buffer; pk: Buffer }
		>;

		if (version) {
			if (keypair.has(version) === false) {
				throw Error(`Key-pair ${name} version ${version} not found.`);
			}

			return keypair.get(version) as { sk: Buffer; pk: Buffer };
		}

		return keypair.get(0) as { sk: Buffer; pk: Buffer };
	}
}
