import path from 'path';
import fs from 'fs';

import type { VersionedKeyPair } from '@/types';

import { AbstractKeyManagerService } from '@/core/services/AbstractKeyManagerService';
import { readAll } from '@/utils/indexes';

export class KeyPairManagerService extends AbstractKeyManagerService<{
	sk: Buffer;
	pk: Buffer;
}> {
	public async load(index_name?: string): Promise<true> {
		if (index_name) {
			const index = await readAll<VersionedKeyPair>(
				'keypairs',
				this._path,
				index_name
			);

			index.forEach(i => {
				this._secrets.set(i.version, {
					sk: fs.readFileSync(i.sk),
					pk: fs.readFileSync(i.pk),
				});
			});

			return true;
		}

		const sk = fs.readFileSync(path.join(this._path, `${this._name}.sk.key`));
		const pk = fs.readFileSync(path.join(this._path, `${this._name}.pk.key`));

		this._secrets.set(this._current_version, { sk, pk });
		return true;
	}
}
