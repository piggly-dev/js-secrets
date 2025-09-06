import path from 'node:path';
import fs from 'node:fs';

import type { VersionedKeyPair } from '@/types/index.js';

import { AbstractKeyManagerService } from '@/core/services/AbstractKeyManagerService.js';
import { readAll } from '@/utils/indexes.js';

export class KeyPairManagerService extends AbstractKeyManagerService<{
	pk: Buffer;
	sk: Buffer;
}> {
	public async load(index_name?: string): Promise<true> {
		if (index_name) {
			const index = await readAll<VersionedKeyPair>(
				'keypairs',
				this._path,
				index_name,
			);

			index.forEach(i => {
				this._secrets.set(i.version, {
					pk: fs.readFileSync(i.pk),
					sk: fs.readFileSync(i.sk),
				});
			});

			return true;
		}

		const sk = fs.readFileSync(path.join(this._path, `${this._name}.sk.key`));
		const pk = fs.readFileSync(path.join(this._path, `${this._name}.pk.key`));

		this._secrets.set(this._current_version, { pk, sk });
		return true;
	}
}
