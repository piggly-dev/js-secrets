import path from 'path';

import { createPath, exists, removeFile, writeFile } from '@/utils/file';
import { readAll, versionExists, write } from '@/utils/indexes';
import { secretToFile, keyPairsToFile } from '@/utils/keys';
import { VersionedKey, VersionedKeyPair } from '@/types';

jest.mock('@/utils/file', () => ({
	createPath: jest.fn(),
	exists: jest.fn(),
	removeFile: jest.fn(),
	writeFile: jest.fn(),
}));

jest.mock('@/utils/indexes', () => ({
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

			const result = await secretToFile(mockPath, 'testSecret', 1, secret);

			expect(createPath).toHaveBeenCalledWith(mockPath);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.secret.key')
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.secret.key'),
				secret
			);
			expect(result).toEqual({
				file: '/mock/path/testSecret.secret.key',
				name: 'testSecret',
				version: 1,
			});
		});

		it('should throw an error if the secret already exists and replace is false', async () => {
			const existsMock = exists as jest.Mock;
			existsMock.mockReturnValue(true);

			await expect(
				secretToFile(mockPath, 'testSecret', 1, Buffer.from('secret data'))
			).rejects.toThrow('Key testSecret already exists.');
		});

		it('should replace the existing secret if replace is true', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const secret = Buffer.from('secret data');

			writeFileMock.mockResolvedValue('any');
			existsMock.mockReturnValue(true);

			await secretToFile(mockPath, 'testSecret', 1, secret, undefined, true);

			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.secret.key')
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

			const result = await secretToFile(
				mockPath,
				'testSecret',
				1,
				secret,
				indexName,
				false
			);

			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testSecret.secret.key')
			);
			expect(readAll).toHaveBeenCalledWith('secrets', mockPath, indexName);
			expect(versionExists).toHaveBeenCalledWith(indexes, 1);
			expect(write).toHaveBeenCalledWith('secrets', mockPath, indexName, [
				{
					file: '/mock/path/testSecret.secret.key',
					name: 'testSecret',
					version: 1,
				},
			]);
			expect(result).toEqual({
				file: '/mock/path/testSecret.secret.key',
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
				secretToFile(mockPath, 'testSecret', 1, secret, indexName)
			).rejects.toThrow('Version 1 already exists.');
		});

		it('should thrown an error if cannot write a file', async () => {
			const existsMock = exists as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const secret = Buffer.from('secret data');

			existsMock.mockReturnValue(false);
			writeFileMock.mockRejectedValue(new Error('Failed to write file.'));

			await expect(
				secretToFile(mockPath, 'testSecret', 1, secret)
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
				secretToFile(mockPath, 'testSecret', 1, secret, indexName)
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

			const result = await keyPairsToFile(mockPath, 'testKeyPair', 1, keys);

			expect(createPath).toHaveBeenCalledWith(mockPath);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.sk.key')
			);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.pk.key')
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.sk.key'),
				keys.sk
			);
			expect(writeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.pk.key'),
				keys.pk
			);
			expect(result).toEqual({
				sk: '/mock/path/testKeyPair.sk.key',
				pk: '/mock/path/testKeyPair.pk.key',
				name: 'testKeyPair',
				version: 1,
			});
		});

		it('should throw an error if the key pair already exists and replace is false', async () => {
			const existsMock = exists as jest.Mock;
			existsMock.mockReturnValue(true);

			await expect(
				keyPairsToFile(mockPath, 'testKeyPair', 1, {
					sk: Buffer.from('secret key'),
					pk: Buffer.from('public key'),
				})
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

			await keyPairsToFile(mockPath, 'testKeyPair', 1, keys, undefined, true);

			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.sk.key')
			);
			expect(removeFile).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.pk.key')
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

			const result = await keyPairsToFile(
				mockPath,
				'testKeyPair',
				1,
				keys,
				indexName,
				false
			);

			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.sk.key')
			);
			expect(exists).toHaveBeenCalledWith(
				path.join(mockPath, 'testKeyPair.pk.key')
			);
			expect(readAll).toHaveBeenCalledWith('secrets', mockPath, indexName);
			expect(versionExists).toHaveBeenCalledWith(indexes, 1);
			expect(write).toHaveBeenCalledWith('keypairs', mockPath, indexName, [
				{
					sk: '/mock/path/testKeyPair.sk.key',
					pk: '/mock/path/testKeyPair.pk.key',
					name: 'testKeyPair',
					version: 1,
				},
			]);
			expect(result).toEqual({
				sk: '/mock/path/testKeyPair.sk.key',
				pk: '/mock/path/testKeyPair.pk.key',
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
				keyPairsToFile(mockPath, 'testSecret', 1, keys, indexName)
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
				keyPairsToFile(mockPath, 'testSecret', 1, keys)
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
				keyPairsToFile(mockPath, 'testSecret', 1, keys, indexName)
			).rejects.toThrow('Failed to write index file.');
		});
	});
});
