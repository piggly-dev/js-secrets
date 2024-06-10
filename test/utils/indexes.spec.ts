import path from 'path';

import { write, readAll, readKey, remove, versionExists } from '@/utils/indexes';
import { readFile, writeFile } from '@/utils/file';
import { VersionedKey } from '@/types';

jest.mock('@/utils/file', () => ({
	readFile: jest.fn(),
	writeFile: jest.fn(),
}));

describe('Index Functions', () => {
	const mockPath = '/mock/path';
	const indexName = 'testIndex';

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('write', () => {
		it('should write indexes to a file', async () => {
			const indexes: VersionedKey[] = [
				{ file: 'file', name: 'name', version: 1 },
			];
			const writeFileMock = writeFile as jest.Mock;

			await write('secrets', mockPath, indexName, indexes);

			expect(writeFileMock).toHaveBeenCalledWith(
				path.join(mockPath, `${indexName}.index.secrets.json`),
				JSON.stringify(indexes)
			);
		});
	});

	describe('readAll', () => {
		it('should read all indexes from a file', async () => {
			const readFileMock = readFile as jest.Mock;
			const indexes: VersionedKey[] = [
				{ file: 'file', name: 'name', version: 1 },
			];
			readFileMock.mockResolvedValueOnce(JSON.stringify(indexes));

			const result = await readAll<VersionedKey>('secrets', mockPath, indexName);

			expect(result).toEqual(indexes);
			expect(readFileMock).toHaveBeenCalledWith(
				path.join(mockPath, `${indexName}.index.secrets.json`)
			);
		});

		it('should return an empty array if the file does not exist', async () => {
			const readFileMock = readFile as jest.Mock;
			readFileMock.mockRejectedValueOnce(new Error('File not found'));

			const result = await readAll<VersionedKey>('secrets', mockPath, indexName);

			expect(result).toEqual([]);
		});
	});

	describe('readKey', () => {
		it('should read a specific key by version', async () => {
			const readFileMock = readFile as jest.Mock;
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];
			readFileMock.mockResolvedValueOnce(JSON.stringify(indexes));

			const result = await readKey<VersionedKey>(
				'secrets',
				mockPath,
				indexName,
				1
			);

			expect(result).toEqual(indexes[0]);
		});

		it('should throw an error if the version is not found', async () => {
			const readFileMock = readFile as jest.Mock;
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];
			readFileMock.mockResolvedValueOnce(JSON.stringify(indexes));

			await expect(
				readKey<VersionedKey>('secrets', mockPath, indexName, 2)
			).rejects.toThrow('Version 2 not found.');
		});
	});

	describe('remove', () => {
		it('should remove a specific key by version', async () => {
			const readFileMock = readFile as jest.Mock;
			const writeFileMock = writeFile as jest.Mock;
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];
			readFileMock.mockResolvedValueOnce(JSON.stringify(indexes));

			await remove('secrets', mockPath, indexName, 1);

			expect(writeFileMock).toHaveBeenCalledWith(
				path.join(mockPath, `${indexName}.index.secrets.json`),
				JSON.stringify([])
			);
		});

		it('should throw an error if the version is not found', async () => {
			const readFileMock = readFile as jest.Mock;
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];
			readFileMock.mockResolvedValueOnce(JSON.stringify(indexes));

			await expect(remove('secrets', mockPath, indexName, 2)).rejects.toThrow(
				'Version 2 not found.'
			);
		});
	});

	describe('versionExists', () => {
		it('should return true if the version exists', () => {
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];

			const result = versionExists(indexes, 1);

			expect(result).toBe(true);
		});

		it('should return false if the version does not exist', () => {
			const indexes: VersionedKey[] = [
				{ version: 1, file: 'file', name: 'name' },
			];

			const result = versionExists(indexes, 2);

			expect(result).toBe(false);
		});
	});
});
