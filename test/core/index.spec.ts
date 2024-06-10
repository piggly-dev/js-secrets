import {
	supportsKeyAlgorithm,
	generateKeyPair,
	recoverKeyPair,
	supportsEncryptAlgorithm,
	generateSecret,
} from '@/core';
import { GenerateKeyPairOptions, GenerateSecretOptions } from '@/types';
import { keyPairsToFile, secretToFile } from '@/utils/keys';
import * as ed25519 from '@/core/keys/ed25519';
import * as aes from '@/core/secrets/aes256';
import { mnemonic, seed } from '@/utils';

jest.mock('@/utils/keys', () => ({
	keyPairsToFile: jest.fn(),
	secretToFile: jest.fn(),
}));

jest.mock('@/utils', () => ({
	mnemonic: jest.fn(),
	seed: jest.fn(),
}));

jest.mock('@/core/keys/ed25519', () => ({
	generateKeyPair: jest.fn(),
}));

jest.mock('@/core/secrets/aes256', () => ({
	generateSecret: jest.fn(),
}));

describe('core -> index', () => {
	const mockPath = '/mock/path';
	const mockKeyName = 'testKey';
	const mockVersion = 1;
	const mockMnemonic = 'test mnemonic';
	const mockSeed = Buffer.from('test seed');
	const mockSecret = Buffer.from('mock secret data');
	const mockKeys = {
		sk: Buffer.from('mock secret key data'),
		pk: Buffer.from('mock public key data'),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(mnemonic as jest.Mock).mockReturnValue(mockMnemonic);
		(seed as jest.Mock).mockResolvedValue(mockSeed);
		(ed25519.generateKeyPair as jest.Mock).mockReturnValue(mockKeys);
		(aes.generateSecret as jest.Mock).mockReturnValue(mockSecret);
		(keyPairsToFile as jest.Mock).mockResolvedValue({
			sk: 'mock/sk/path',
			pk: 'mock/pk/path',
			name: mockKeyName,
			version: mockVersion,
			index: 'mock/index/path',
		});
		(secretToFile as jest.Mock).mockResolvedValue({
			file: 'mock/file/path',
			name: mockKeyName,
			version: mockVersion,
			index: 'mock/index/path',
		});
	});

	describe('supportsKeyAlgorithm', () => {
		it('should return true for supported algorithms', () => {
			expect(supportsKeyAlgorithm('ed25519')).toBe(true);
		});

		it('should return false for unsupported algorithms', () => {
			expect(supportsKeyAlgorithm('rsa')).toBe(false);
		});
	});

	describe('generateKeyPair', () => {
		it('should generate a key pair', async () => {
			const options: GenerateKeyPairOptions = {
				mnemonic: { language: 'english' },
				seed: { password: 'test password' },
			};

			const result = await generateKeyPair(
				'ed25519',
				mockPath,
				mockKeyName,
				mockVersion,
				options
			);

			expect(mnemonic).toHaveBeenCalledWith(options.mnemonic);
			expect(seed).toHaveBeenCalledWith(mockMnemonic, options.seed);
			expect(ed25519.generateKeyPair).toHaveBeenCalledWith(mockSeed);
			expect(keyPairsToFile).toHaveBeenCalledWith(
				mockPath,
				mockKeyName,
				mockVersion,
				mockKeys,
				undefined
			);
			expect(result).toEqual({
				mnemonic: mockMnemonic,
				files: {
					sk: 'mock/sk/path',
					pk: 'mock/pk/path',
					name: mockKeyName,
					version: mockVersion,
					index: 'mock/index/path',
				},
			});
		});

		it('should throw an error for unsupported algorithms', async () => {
			const options: GenerateKeyPairOptions = {
				mnemonic: { language: 'english' },
				seed: { password: 'test password' },
			};

			await expect(
				generateKeyPair('rsa', mockPath, mockKeyName, mockVersion, options)
			).rejects.toThrow('Algorithm rsa not supported.');
		});
	});

	describe('recoverKeyPair', () => {
		it('should recover a key pair', async () => {
			const options: Omit<GenerateKeyPairOptions, 'mnemonic'> = {
				seed: { password: 'test password' },
			};

			const result = await recoverKeyPair(
				'ed25519',
				mockMnemonic,
				mockPath,
				mockKeyName,
				mockVersion,
				options
			);

			expect(seed).toHaveBeenCalledWith(mockMnemonic, options.seed);
			expect(ed25519.generateKeyPair).toHaveBeenCalledWith(mockSeed);
			expect(keyPairsToFile).toHaveBeenCalledWith(
				mockPath,
				mockKeyName,
				mockVersion,
				mockKeys,
				undefined,
				true
			);
			expect(result).toEqual({
				mnemonic: mockMnemonic,
				files: {
					sk: 'mock/sk/path',
					pk: 'mock/pk/path',
					name: mockKeyName,
					version: mockVersion,
					index: 'mock/index/path',
				},
			});
		});

		it('should throw an error for unsupported algorithms', async () => {
			const options: Omit<GenerateKeyPairOptions, 'mnemonic'> = {
				seed: { password: 'test password' },
			};

			await expect(
				recoverKeyPair(
					'rsa',
					mockMnemonic,
					mockPath,
					mockKeyName,
					mockVersion,
					options
				)
			).rejects.toThrow('Algorithm rsa not supported.');
		});
	});

	describe('supportsEncryptAlgorithm', () => {
		it('should return true for supported algorithms', () => {
			expect(supportsEncryptAlgorithm('aes256')).toBe(true);
		});

		it('should return false for unsupported algorithms', () => {
			expect(supportsEncryptAlgorithm('des')).toBe(false);
		});
	});

	describe('generateSecret', () => {
		it('should generate a secret', async () => {
			const options: GenerateSecretOptions = {
				seed: { password: 'test password' },
			};

			const result = await generateSecret(
				'aes256',
				mockMnemonic,
				mockPath,
				mockKeyName,
				mockVersion,
				options
			);

			expect(seed).toHaveBeenCalledWith(mockMnemonic, options.seed);
			expect(aes.generateSecret).toHaveBeenCalledWith(mockSeed);
			expect(secretToFile).toHaveBeenCalledWith(
				mockPath,
				mockKeyName,
				mockVersion,
				mockSecret,
				undefined,
				false
			);
			expect(result).toEqual({
				mnemonic: mockMnemonic,
				files: {
					file: 'mock/file/path',
					name: mockKeyName,
					version: mockVersion,
					index: 'mock/index/path',
				},
			});
		});

		it('should throw an error for unsupported algorithms', async () => {
			const options: GenerateSecretOptions = {
				seed: { password: 'test password' },
			};

			await expect(
				generateSecret(
					'des',
					mockMnemonic,
					mockPath,
					mockKeyName,
					mockVersion,
					options
				)
			).rejects.toThrow('Algorithm des not supported.');
		});
	});
});
