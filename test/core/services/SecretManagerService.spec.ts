import path from 'node:path';
import fs from 'node:fs';

import { SecretManagerService } from '@/core/services/SecretManagerService.js';
import { readAll } from '@/utils/indexes.js';
import { VersionedKey } from '@/types/index.js';

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
		secretManager = new SecretManagerService(mockName, mockPath);
	});

	describe('load', () => {
		it('should load a secret without an index', async () => {
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);

			const result = await secretManager.load();

			expect(result).toBe(true);
			expect(fs.readFileSync).toHaveBeenCalledWith(
				path.join(mockPath, `${mockName}.secret.key`),
			);
			expect(secretManager.raw.get(1)).toEqual(mockSecret);
		});

		it('should load secrets with an index', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKey]);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);

			const result = await secretManager.load(mockIndexName);

			expect(result).toBe(true);
			expect(readAll).toHaveBeenCalledWith('secrets', mockPath, mockIndexName);
			expect(fs.readFileSync).toHaveBeenCalledWith(mockVersionedKey.file);
			expect(secretManager.raw.get(mockVersionedKey.version)).toEqual(mockSecret);
		});
	});

	describe('get', () => {
		beforeEach(async () => {
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);
			await secretManager.load(mockName);
		});

		it('should get the loaded secret', () => {
			const secret = secretManager.get();

			expect(secret).toEqual(mockSecret);
		});

		it('should throw an error if the secret is not found', async () => {
			expect(() => secretManager.get(10)).toThrow(
				'Key/secret version 10 not found for testSecret.',
			);
		});

		it('should get the loaded secret with a specific version', async () => {
			(readAll as jest.Mock).mockResolvedValue([mockVersionedKey]);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockSecret);
			await secretManager.load(mockIndexName);
			const secret = secretManager.get(mockVersionedKey.version);

			expect(secret).toEqual(mockSecret);
		});

		it('should throw an error if the versioned secret is not found', async () => {
			expect(() => secretManager.get(2)).toThrow(
				`Key/secret version 2 not found for testSecret.`,
			);
		});
	});
});
