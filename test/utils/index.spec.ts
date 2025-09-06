import { wordlists, mnemonicToSeed, generateMnemonic } from 'bip39';
import crypto from 'node:crypto';

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

jest.mock('node:url', () => ({
	fileURLToPath: jest.fn(),
	pathToFileURL: jest.fn(),
}));

jest.mock('node:crypto', () => ({
	createHash: jest.fn().mockReturnValue({
		update: jest.fn().mockReturnValue({
			digest: jest.fn(),
		}),
	}),
}));

jest.mock('node:path', () => ({
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
			const result = parseFileName('Parsed File.txt');
			expect(result).toBe('parsed_file');
		});
	});

	describe('parseAbspath', () => {
		it('should return the provided absolute path', () => {
			const abspath = '/absolute/path';
			expect(parseAbspath(abspath)).toBe(abspath);
		});

		it('should return default path if no path is provided', () => {
			const mockPath = '/mock/path';
			const result = parseAbspath(mockPath);
			expect(result).toBe(mockPath);
		});
	});
});
