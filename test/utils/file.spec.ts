import fs from 'fs';

import { createPath, exists, readFile, writeFile, removeFile } from '@/utils/file';

jest.mock('fs', () => ({
	existsSync: jest.fn(),
	mkdirSync: jest.fn(),
	readFile: jest.fn(),
	writeFile: jest.fn(),
	unlink: jest.fn(),
}));

describe('utils -> file', () => {
	const existsSyncMocked = fs.existsSync as jest.Mock;
	const mkdirSyncMocked = fs.mkdirSync as jest.Mock;
	const readFileMocked = fs.readFile as unknown as jest.Mock;
	const writeFileMocked = fs.writeFile as unknown as jest.Mock;
	const unlinkMocked = fs.unlink as unknown as jest.Mock;

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('createPath', () => {
		it('should create a new path if it does not exist', () => {
			existsSyncMocked.mockReturnValue(false);
			mkdirSyncMocked.mockImplementation(() => {});

			createPath('/fake/path');

			expect(existsSyncMocked).toHaveBeenCalledWith('/fake/path');
			expect(mkdirSyncMocked).toHaveBeenCalledWith('/fake/path');
		});

		it('should not create a path if it already exists', () => {
			existsSyncMocked.mockReturnValue(true);

			createPath('/fake/path');

			expect(existsSyncMocked).toHaveBeenCalledWith('/fake/path');
			expect(mkdirSyncMocked).not.toHaveBeenCalled();
		});
	});

	describe('exists', () => {
		it('should return true if the file exists', () => {
			existsSyncMocked.mockReturnValue(true);

			expect(exists('/fake/file')).toBe(true);
			expect(existsSyncMocked).toHaveBeenCalledWith('/fake/file');
		});

		it('should return false if the file does not exist', () => {
			existsSyncMocked.mockReturnValue(false);

			expect(exists('/fake/file')).toBe(false);
			expect(existsSyncMocked).toHaveBeenCalledWith('/fake/file');
		});
	});

	describe('readFile', () => {
		it('should read a file successfully', async () => {
			const fakeData = Buffer.from('fake data');
			readFileMocked.mockImplementation((path, callback: any) => {
				callback(null, fakeData);
			});

			const data = await readFile('/fake/file');
			expect(data).toBe(fakeData);
			expect(readFileMocked).toHaveBeenCalledWith(
				'/fake/file',
				expect.any(Function)
			);
		});

		it('should throw an error if the file cannot be read', async () => {
			const error = new Error('read error');
			readFileMocked.mockImplementation((path, callback: any) => {
				callback(error, null);
			});

			await expect(readFile('/fake/file')).rejects.toThrow('read error');
			expect(readFileMocked).toHaveBeenCalledWith(
				'/fake/file',
				expect.any(Function)
			);
		});
	});

	describe('writeFile', () => {
		it('should write data to a file successfully', async () => {
			writeFileMocked.mockImplementation((path, data, callback: any) => {
				callback(null);
			});

			const result = await writeFile('/fake/file', 'fake data');
			expect(result).toBe('/fake/file');
			expect(writeFileMocked).toHaveBeenCalledWith(
				'/fake/file',
				'fake data',
				expect.any(Function)
			);
		});

		it('should throw an error if the file cannot be written', async () => {
			const error = new Error('write error');
			writeFileMocked.mockImplementation((path, data, callback: any) => {
				callback(error);
			});

			await expect(writeFile('/fake/file', 'fake data')).rejects.toThrow(
				'write error'
			);
			expect(writeFileMocked).toHaveBeenCalledWith(
				'/fake/file',
				'fake data',
				expect.any(Function)
			);
		});
	});

	describe('removeFile', () => {
		it('should remove a file successfully', async () => {
			unlinkMocked.mockImplementation((path, callback: any) => {
				callback(null);
			});

			const result = await removeFile('/fake/file');
			expect(result).toBe('/fake/file');
			expect(unlinkMocked).toHaveBeenCalledWith(
				'/fake/file',
				expect.any(Function)
			);
		});

		it('should still return the filename if the file cannot be removed', async () => {
			const error = new Error('unlink error');
			unlinkMocked.mockImplementation((path, callback: any) => {
				callback(error);
			});

			const result = await removeFile('/fake/file');
			expect(result).toBe('/fake/file');
			expect(unlinkMocked).toHaveBeenCalledWith(
				'/fake/file',
				expect.any(Function)
			);
		});
	});
});
