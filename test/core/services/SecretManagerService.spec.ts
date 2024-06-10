import path from 'path';
import fs from 'fs';

import { SecretManagerService } from '@/core/services/SecretManagerService';
import { readAll } from '@/utils/indexes';
import { VersionedKey } from '@/types';

jest.mock('fs');
jest.mock('@/utils/indexes', () => ({
	readAll: jest.fn(),
}));

describe('core -> services -> SecretManagerService', () => {
	const mockPath = '/mock/path';
	const mockName = 'testSecret';
	const mockIndexName = 'testIndex';
	const mockSecret = Buffer.from('mock secret data');
	const mockVersionedKey: VersionedKey = {
		version: 1,
		file: path.join(mockPath, `${mockName}.secret.key`),
		name: mockName,
	};

	let secretManager: SecretManagerService;

	beforeEach(() => {
		jest.clearAllMocks();
		secretManager = new SecretManagerService(mockPath);
	});

	describe('load', () => {
		it('should load a secret without an index', async () => {
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);

			const result = await secretManager.load(mockName);

			expect(result).toBe(true);
			expect(fs.readFileSync).toHaveBeenCalledWith(
				path.join(mockPath, `${mockName}.secret.key`)
			);
			expect(secretManager.raw.get(mockName)?.get(0)).toEqual(mockSecret);
		});

		it('should load secrets with an index', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKey]);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);

			const result = await secretManager.load(mockName, mockIndexName);

			expect(result).toBe(true);
			expect(readAll).toHaveBeenCalledWith('secrets', mockPath, mockIndexName);
			expect(fs.readFileSync).toHaveBeenCalledWith(mockVersionedKey.file);
			expect(
				secretManager.raw.get(mockName)?.get(mockVersionedKey.version)
			).toEqual(mockSecret);
		});
	});

	describe('get', () => {
		beforeEach(async () => {
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);
			await secretManager.load(mockName);
		});

		it('should get the loaded secret', async () => {
			const secret = await secretManager.get(mockName);

			expect(secret).toEqual(mockSecret);
		});

		it('should throw an error if the secret is not found', async () => {
			await expect(secretManager.get('nonExistentSecret')).rejects.toThrow(
				'Secret nonExistentSecret not found.'
			);
		});

		it('should get the loaded secret with a specific version', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKey]);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);
			await secretManager.load(mockName, mockIndexName);
			const secret = await secretManager.get(mockName, mockVersionedKey.version);

			expect(secret).toEqual(mockSecret);
		});

		it('should throw an error if the versioned secret is not found', async () => {
			await expect(secretManager.get(mockName, 2)).rejects.toThrow(
				`Secret ${mockName} version 2 not found.`
			);
		});
	});
});
