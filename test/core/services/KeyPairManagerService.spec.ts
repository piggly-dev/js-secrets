import path from 'path';
import fs from 'fs';

import { KeyPairManagerService } from '@/core/services/KeyPairManagerService';
import { VersionedKeyPair } from '@/types';
import { readAll } from '@/utils/indexes';

jest.mock('fs');
jest.mock('@/utils/indexes', () => ({
	readAll: jest.fn(),
}));

describe('core -> services -> KeyPairManagerService', () => {
	const mockPath = '/mock/path';
	const mockName = 'testKeyPair';
	const mockIndexName = 'testIndex';
	const mockSecretKey = Buffer.from('mock secret key data');
	const mockPublicKey = Buffer.from('mock public key data');
	const mockVersionedKeyPair: VersionedKeyPair = {
		version: 1,
		sk: path.join(mockPath, `${mockName}.sk.key`),
		pk: path.join(mockPath, `${mockName}.pk.key`),
		name: mockName,
	};

	let keyPairManager: KeyPairManagerService;

	beforeEach(() => {
		jest.clearAllMocks();
		keyPairManager = new KeyPairManagerService(mockPath);
	});

	describe('load', () => {
		it('should load a key pair without an index', async () => {
			(fs.readFileSync as jest.Mock).mockImplementation(filePath => {
				if (filePath.endsWith('.sk.key')) {
					return mockSecretKey;
				}
				if (filePath.endsWith('.pk.key')) {
					return mockPublicKey;
				}
				return null;
			});

			const result = await keyPairManager.load(mockName);

			expect(result).toBe(true);
			expect(fs.readFileSync).toHaveBeenCalledWith(
				path.join(mockPath, `${mockName}.sk.key`)
			);
			expect(fs.readFileSync).toHaveBeenCalledWith(
				path.join(mockPath, `${mockName}.pk.key`)
			);
			expect(keyPairManager.raw.get(mockName)?.get(1)).toEqual({
				sk: mockSecretKey,
				pk: mockPublicKey,
			});
		});

		it('should load key pairs with an index', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKeyPair]);
			(fs.readFileSync as jest.Mock).mockImplementation(filePath => {
				if (filePath.endsWith('.sk.key')) {
					return mockSecretKey;
				}
				if (filePath.endsWith('.pk.key')) {
					return mockPublicKey;
				}
				return null;
			});

			const result = await keyPairManager.load(mockName, mockIndexName);

			expect(result).toBe(true);
			expect(readAll).toHaveBeenCalledWith('keypairs', mockPath, mockIndexName);
			expect(fs.readFileSync).toHaveBeenCalledWith(mockVersionedKeyPair.sk);
			expect(fs.readFileSync).toHaveBeenCalledWith(mockVersionedKeyPair.pk);
			expect(
				keyPairManager.raw.get(mockName)?.get(mockVersionedKeyPair.version)
			).toEqual({
				sk: mockSecretKey,
				pk: mockPublicKey,
			});
		});
	});

	describe('get', () => {
		beforeEach(async () => {
			(fs.readFileSync as jest.Mock).mockImplementation(filePath => {
				if (filePath.endsWith('.sk.key')) {
					return mockSecretKey;
				}
				if (filePath.endsWith('.pk.key')) {
					return mockPublicKey;
				}
				return null;
			});
			await keyPairManager.load(mockName);
		});

		it('should get the loaded key pair', async () => {
			const keyPair = await keyPairManager.get(mockName);

			expect(keyPair).toEqual({ sk: mockSecretKey, pk: mockPublicKey });
		});

		it('should throw an error if the key pair is not found', async () => {
			await expect(keyPairManager.get('nonExistentKeyPair')).rejects.toThrow(
				'Key-pair nonExistentKeyPair not found.'
			);
		});

		it('should get the loaded key pair with a specific version', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKeyPair]);
			await keyPairManager.load(mockName, mockIndexName);

			const keyPair = await keyPairManager.get(
				mockName,
				mockVersionedKeyPair.version
			);

			expect(keyPair).toEqual({ sk: mockSecretKey, pk: mockPublicKey });
		});

		it('should throw an error if the versioned key pair is not found', async () => {
			await expect(keyPairManager.get(mockName, 2)).rejects.toThrow(
				`Key-pair ${mockName} version 2 not found.`
			);
		});
	});
});
