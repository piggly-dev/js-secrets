import { wordlists, mnemonicToSeed, generateMnemonic } from 'bip39';
import { pathToFileURL, fileURLToPath } from 'node:url';
import slugify from 'slugify';
import crypto from 'crypto';
import path from 'node:path';

import {
	bufferToHex,
	bufferToString,
	cutBuffer,
	hash,
	mnemonic,
	parseAbspath,
	parseFileName,
	seed,
	splitWords,
	stringToBuffer,
	supportsMnemonicLanguage,
} from '@/utils/index.js';

jest.mock('bip39', () => ({
	wordlists: { english: ['word1', 'word2'] },
	mnemonicToSeed: jest.fn(),
	generateMnemonic: jest.fn(),
}));

jest.mock('url', () => ({
	fileURLToPath: jest.fn(),
	pathToFileURL: jest.fn(),
}));

jest.mock('slugify', () => jest.fn());

jest.mock('crypto', () => ({
	createHash: jest.fn().mockReturnValue({
		update: jest.fn().mockReturnValue({
			digest: jest.fn(),
		}),
	}),
}));

jest.mock('path', () => ({
	join: jest.fn(),
	dirname: jest.fn(),
	resolve: jest.fn(),
}));

describe('utils -> index', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('supportsMnemonicLanguage', () => {
		it('should return true if the language is supported', () => {
			expect(supportsMnemonicLanguage('english')).toBe(true);
		});

		it('should return false if the language is not supported', () => {
			expect(supportsMnemonicLanguage('unsupported')).toBe(false);
		});
	});

	describe('mnemonic', () => {
		it('should generate mnemonic with default options', () => {
			(generateMnemonic as jest.Mock).mockReturnValue('mnemonic');
			const result = mnemonic();
			expect(result).toBe('mnemonic');
			expect(generateMnemonic).toHaveBeenCalled();
		});

		it('should throw an error for unsupported language', () => {
			expect(() => mnemonic({ language: 'unsupported' } as any)).toThrow(
				'Language unsupported not supported.',
			);
		});

		it('should generate mnemonic with specified language', () => {
			(generateMnemonic as jest.Mock).mockReturnValue('mnemonic');
			const result = mnemonic({ language: 'english' });
			expect(result).toBe('mnemonic');
			expect(generateMnemonic).toHaveBeenCalledWith(
				undefined,
				undefined,
				wordlists.english,
			);
		});
	});

	describe('seed', () => {
		it('should generate seed from mnemonic', async () => {
			const mockSeed = Buffer.from('seed');
			(mnemonicToSeed as jest.Mock).mockImplementation(() => mockSeed);
			const result = await seed('mnemonic');
			expect(result).toBe(mockSeed);
			expect(mnemonicToSeed).toHaveBeenCalledWith('mnemonic', undefined);
		});
	});

	describe('hash', () => {
		it('should generate hash of the message', () => {
			const mockDigest = jest.fn().mockReturnValue('hashed');
			const mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest });
			(crypto.createHash as jest.Mock).mockReturnValue({ update: mockUpdate });

			const result = hash('sha256', 'message');
			expect(result).toBe('hashed');
			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockUpdate).toHaveBeenCalledWith('message');
			expect(mockDigest).toHaveBeenCalled();
		});
	});

	describe('cutBuffer', () => {
		it('should cut buffer to specified length', () => {
			const buffer = Buffer.from('123456');
			const result = cutBuffer(buffer, 3);
			expect(result).toEqual(Buffer.from('123'));
		});
	});

	describe('bufferToHex', () => {
		it('should convert buffer to hex string', () => {
			const buffer = Buffer.from('123');
			const result = bufferToHex(buffer);
			expect(result).toBe('313233');
		});
	});

	describe('bufferToString', () => {
		it('should convert buffer to string', () => {
			const buffer = Buffer.from('123');
			const result = bufferToString(buffer);
			expect(result).toBe('123');
		});
	});

	describe('stringToBuffer', () => {
		it('should convert string to buffer', () => {
			const message = '123';
			const result = stringToBuffer(message);
			expect(result).toEqual(Buffer.from('123'));
		});
	});

	describe('splitWords', () => {
		it('should split words into chunks of specified size', () => {
			const input = 'one two three four five six seven eight';
			const result = splitWords(input, 3);
			expect(result).toEqual([
				['one', 'two', 'three'],
				['four', 'five', 'six'],
				['seven', 'eight'],
			]);
		});
	});

	describe('parseFileName', () => {
		it('should slugify the file name', () => {
			(slugify as unknown as jest.Mock).mockReturnValue('parsed_file');
			const result = parseFileName('Parsed File.txt');
			expect(result).toBe('parsed_file');
			expect(slugify).toHaveBeenCalledWith('Parsed File.txt', {
				replacement: '_',
				remove: expect.any(RegExp),
				lower: true,
				strict: true,
			});
		});
	});

	describe('parseAbspath', () => {
		it('should throw an error if path is not absolute', () => {
			expect(() => parseAbspath('relative/path')).toThrow(
				'Path is required and must be absolute.',
			);
		});

		it('should return the provided absolute path', () => {
			const abspath = '/absolute/path';
			expect(parseAbspath(abspath)).toBe(abspath);
		});

		it('should return default path if no path is provided', () => {
			const mockPath = '/mock/path';
			(path.join as jest.Mock).mockReturnValue(mockPath);
			(pathToFileURL as jest.Mock).mockReturnValue('/current/path');
			(fileURLToPath as jest.Mock).mockReturnValue('/current/path');
			const result = parseAbspath();
			expect(result).toBe(mockPath);
			expect(path.join).toHaveBeenCalledWith(
				path.dirname('/current/path'),
				'..',
				'..',
				'keys',
			);
		});
	});
});
