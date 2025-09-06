import path from 'node:path';

import { createPath, exists, removeFile, writeFile } from '@/utils/file.js';
import { readAll, versionExists, write } from '@/utils/indexes.js';
import { secretToFile, keyPairsToFile } from '@/utils/keys.js';
import { VersionedKey, VersionedKeyPair } from '@/types/index.js';

jest.mock('@/utils/file.js', () => ({
	createPath: jest.fn(),
	exists: jest.fn(),
	removeFile: jest.fn(),
	writeFile: jest.fn(),
}));

jest.mock('@/utils/indexes.js', () => ({
	readAll: jest.fn(),
	versionExists: jest.fn(),
	write: jest.fn(),
}));

describe('utils -> keys', () => {
	const mockPath = '/mock/path';
	const indexName = 'testIndex';

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('secretToFile', () => {
		it('should write a secret to a file', async () => {
			const writeFileMock = writeFile as jest.Mock;
			const existsMock = exists as jest.Mock;
			const secret = Buffer.from('secret data');

			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(false);

			const result = await secretToFile(mockPath, 'testSecret', secret, {
				version: 1,
			});

			expect(createPath).toHaveBeenCalledWith(mockPath);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.v1.secret.key'),
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.v1.secret.key'),
				secret,
			);
			expect(result).toEqual({
				file: '/mock/path/testSecret.v1.secret.key',
				name: 'testSecret',
				version: 1,
			});
		});

		it('should throw an error if the secret already exists and replace is false', async () => {
			const existsMock = exists as jest.Mock;
			existsMock.mockReturnValue(true);

			await expect(
				secretToFile(mockPath, 'testSecret', Buffer.from('secret data'), {
					version: 1,
					replace: false,
				}),
			).rejects.toThrow('Key testSecret already exists.');
		});

		it('should replace the existing secret if replace is true', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const secret = Buffer.from('secret data');

			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(true);

			await secretToFile(mockPath, 'testSecret', secret, {
				version: 1,
				replace: true,
			});

			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.v1.secret.key'),
			);
		});

		it('should handle indexable secrets', async () => {
			const writeFileMock = writeFile as jest.Mock;
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const writeMock = write as jest.Mock;
			const secret = Buffer.from('secret data');
			const indexes: VersionedKey[] = [];

			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(false);
			writeMock.mockResolvedValue('/mock/path/textIndex.index.secrets.json');

			const result = await secretToFile(mockPath, 'testSecret', secret, {
				version: 1,
				index_name: indexName,
				replace: false,
			});

			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.v1.secret.key'),
			);
			expect(readAll).toHaveBeenCalledWith('secrets', mockPath, indexName);
			expect(versionExists).toHaveBeenCalledWith(indexes, 1);
			expect(write).toHaveBeenCalledWith('secrets', mockPath, indexName, [
				{
					file: '/mock/path/testSecret.v1.secret.key',
					name: 'testSecret',
					version: 1,
				},
			]);
			expect(result).toEqual({
				file: '/mock/path/testSecret.v1.secret.key',
				name: 'testSecret',
				version: 1,
				index: '/mock/path/textIndex.index.secrets.json',
			});
		});

		it('should thrown an error if version exists', async () => {
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const secret = Buffer.from('secret data');
			const indexes: VersionedKey[] = [];

			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(true);

			await expect(
				secretToFile(mockPath, 'testSecret', secret, {
					version: 1,
					index_name: indexName,
				}),
			).rejects.toThrow('Version 1 already exists.');
		});

		it('should thrown an error if cannot write a file', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const secret = Buffer.from('secret data');

			existsMock.mockReturnValue(false);
			writeFileMock.mockRejectedValue(new Error('Failed to write file.'));

			await expect(
				secretToFile(mockPath, 'testSecret', secret, {
					version: 1,
				}),
			).rejects.toThrow('Failed to write file.');
		});

		it('should thrown an error if cannot write an index file', async () => {
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const writeMock = write as jest.Mock;
			const secret = Buffer.from('secret data');
			const indexes: VersionedKey[] = [];

			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(false);
			writeFileMock.mockResolvedValue('any');
			writeMock.mockRejectedValue(new Error('Failed to write index file.'));

			await expect(
				secretToFile(mockPath, 'testSecret', secret, {
					version: 1,
					index_name: indexName,
				}),
			).rejects.toThrow('Failed to write index file.');
		});
	});

	describe('keyPairsToFile', () => {
		it('should write key pairs to files', async () => {
			const writeFileMock = writeFile as jest.Mock;
			const existsMock = exists as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};
			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(false);

			const result = await keyPairsToFile(mockPath, 'testKeyPair', keys, {
				version: 1,
			});

			expect(createPath).toHaveBeenCalledWith(mockPath);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.sk.key'),
			);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.pk.key'),
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.sk.key'),
				keys.sk,
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.pk.key'),
				keys.pk,
			);
			expect(result).toEqual({
				sk: '/mock/path/testKeyPair.v1.sk.key',
				pk: '/mock/path/testKeyPair.v1.pk.key',
				name: 'testKeyPair',
				version: 1,
			});
		});

		it('should throw an error if the key pair already exists and replace is false', async () => {
			const existsMock = exists as jest.Mock;
			existsMock.mockReturnValue(true);

			await expect(
				keyPairsToFile(
					mockPath,
					'testKeyPair',
					{
						sk: Buffer.from('secret key'),
						pk: Buffer.from('public key'),
					},
					{
						version: 1,
						replace: false,
					},
				),
			).rejects.toThrow('Key testKeyPair already exists.');
		});

		it('should replace the existing key pairs if replace is true', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};
			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(true);

			await keyPairsToFile(mockPath, 'testKeyPair', keys, {
				version: 1,
				replace: true,
			});

			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.sk.key'),
			);
			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.pk.key'),
			);
		});

		it('should handle indexable key pairs', async () => {
			const writeFileMock = writeFile as jest.Mock;
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const writeMock = write as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};
			const indexes: VersionedKeyPair[] = [];
			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(false);
			writeMock.mockResolvedValue('/mock/path/testKeyPair.keypairs.index.json');

			const result = await keyPairsToFile(mockPath, 'testKeyPair', keys, {
				version: 1,
				index_name: indexName,
				replace: false,
			});

			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.sk.key'),
			);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.v1.pk.key'),
			);
			expect(readAll).toHaveBeenCalledWith('keypairs', mockPath, indexName);
			expect(versionExists).toHaveBeenCalledWith(indexes, 1);
			expect(write).toHaveBeenCalledWith('keypairs', mockPath, indexName, [
				{
					sk: '/mock/path/testKeyPair.v1.sk.key',
					pk: '/mock/path/testKeyPair.v1.pk.key',
					name: 'testKeyPair',
					version: 1,
				},
			]);
			expect(result).toEqual({
				sk: '/mock/path/testKeyPair.v1.sk.key',
				pk: '/mock/path/testKeyPair.v1.pk.key',
				name: 'testKeyPair',
				version: 1,
				index: '/mock/path/testKeyPair.keypairs.index.json',
			});
		});

		it('should thrown an error if version exists', async () => {
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};
			const indexes: VersionedKey[] = [];

			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(true);

			await expect(
				keyPairsToFile(mockPath, 'testSecret', keys, {
					version: 1,
					index_name: indexName,
				}),
			).rejects.toThrow('Version 1 already exists.');
		});

		it('should thrown an error if cannot write a file', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};

			existsMock.mockReturnValue(false);
			writeFileMock.mockRejectedValue(new Error('Failed to write file.'));

			await expect(
				keyPairsToFile(mockPath, 'testSecret', keys, {
					version: 1,
				}),
			).rejects.toThrow('Failed to write file.');
		});

		it('should thrown an error if cannot write an index file', async () => {
			const existsMock = exists as jest.Mock;
			const readAllMock = readAll as jest.Mock;
			const versionExistsMock = versionExists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const writeMock = write as jest.Mock;
			const keys = {
				sk: Buffer.from('secret key'),
				pk: Buffer.from('public key'),
			};
			const indexes: VersionedKey[] = [];

			existsMock.mockReturnValue(false);
			readAllMock.mockResolvedValue(indexes);
			versionExistsMock.mockReturnValue(false);
			writeFileMock.mockResolvedValue('any');
			writeMock.mockRejectedValue(new Error('Failed to write index file.'));

			await expect(
				keyPairsToFile(mockPath, 'testSecret', keys, {
					version: 1,
					index_name: indexName,
				}),
			).rejects.toThrow('Failed to write index file.');
		});
	});
});
