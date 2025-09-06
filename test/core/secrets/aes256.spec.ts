import { Transform, Readable } from 'node:stream';
import crypto from 'node:crypto';
import pump from 'pump';

import {
	decryptCTR,
	decryptCTRStream,
	deriveCTREncryptionKey,
	encryptCTR,
	encryptCTRStream,
	generateSecret,
	getCipherCTR,
} from '@/core/secrets/aes256.js';

describe('core -> secrets -> aes256', () => {
	const seed = crypto.randomBytes(64); // master key
	const message = Buffer.from('test message', 'utf8');
	const keys = [crypto.randomBytes(32), crypto.randomBytes(32)]; // random keys

	describe('Common', () => {
		describe('generateSecret', () => {
			it('should generate a 32-byte secret from a seed', () => {
				const secret = generateSecret(seed);
				expect(secret).toBeInstanceOf(Buffer);
				expect(secret.length).toBe(32);
			});
		});
	});

	describe('CTR', () => {
		describe('deriveCTREncryptionKey', () => {
			it('should derive encryption and MAC keys', () => {
				const { k_enc, k_mac } = deriveCTREncryptionKey(seed, keys);

				expect(k_enc).toBeInstanceOf(Buffer);
				expect(k_enc.length).toBe(32);
				expect(k_mac).toBeInstanceOf(Buffer);
				expect(k_mac.length).toBe(32);
			});

			it('should throw an error if the secret is not 32 bytes long', () => {
				expect(() =>
					deriveCTREncryptionKey(Buffer.from('short secret')),
				).toThrow('Secret must be at least 32 bytes long.');
			});

			it('should throw an error if any of the keys are not 32 bytes long', () => {
				expect(() =>
					deriveCTREncryptionKey(seed, [Buffer.from('short key')]),
				).toThrow('Keys must be at least 32 bytes long.');
			});
		});

		describe('getCipherCTR', () => {
			it('should get a cipher, IV, and secret', () => {
				const { cipher, iv, k_enc, k_mac } = getCipherCTR(seed, keys);

				expect(cipher).toBeInstanceOf(crypto.Cipheriv);

				expect(iv).toBeInstanceOf(Buffer);
				expect(iv.length).toBe(16);

				expect(k_enc).toBeInstanceOf(Buffer);
				expect(k_enc.length).toBe(32);

				expect(k_mac).toBeInstanceOf(Buffer);
				expect(k_mac.length).toBe(32);
			});
		});

		describe('encrypt', () => {
			it('should encrypt a message', () => {
				const encrypted = encryptCTR(seed, message, keys);
				expect(encrypted).toBeInstanceOf(Buffer);
				expect(encrypted.length).toBeGreaterThan(16 + 32); // IV + encrypted message + MAC
				expect(encrypted).not.toStrictEqual(message);
				expect(encrypted.toString()).not.toEqual('test message');
			});

			it('should encrypt with AAD', () => {
				const aad = Buffer.from('test aad');

				const encrypted = encryptCTR(seed, message, keys, aad);

				expect(encrypted).toBeInstanceOf(Buffer);
				expect(encrypted.length).toBeGreaterThan(16 + 32); // IV + encrypted message + MAC
				expect(encrypted).not.toStrictEqual(message);
				expect(encrypted.toString()).not.toEqual('test message');
			});
		});

		describe('decrypt', () => {
			it('should decrypt a message', () => {
				const encrypted = encryptCTR(seed, message, keys);
				const decrypted = decryptCTR(seed, encrypted, keys);

				expect(decrypted).toStrictEqual(message);
				expect(decrypted.toString()).toBe('test message');
			});

			it('should decrypt with AAD', () => {
				const aad = Buffer.from('test aad');

				const encrypted = encryptCTR(seed, message, keys, aad);
				const decrypted = decryptCTR(seed, encrypted, keys, aad);

				expect(decrypted).toStrictEqual(message);
				expect(decrypted.toString()).toBe('test message');
			});

			it('should throw an error if the secret is not 32 bytes long', () => {
				expect(() =>
					decryptCTR(Buffer.from('short secret'), Buffer.from('')),
				).toThrow('Secret must be at least 32 bytes long.');
			});

			it('should throw an error if any of the keys are not 32 bytes long', () => {
				expect(() =>
					decryptCTR(seed, Buffer.from(''), [Buffer.from('short key')]),
				).toThrow('Keys must be at least 32 bytes long.');
			});
		});

		describe('encryptStream', () => {
			it('should encrypt data using a stream', done => {
				const instance = encryptCTRStream(seed, keys);
				const chunks: Buffer[] = [];

				instance.on('data', chunk => {
					chunks.push(chunk);
				});

				instance.on('end', () => {
					try {
						const encrypted = Buffer.concat(chunks);

						// IV + encrypted message + MAC
						expect(encrypted.length).toBeGreaterThan(16 + 32);

						// IV cannot be the same as the message
						expect(encrypted.subarray(0, 16)).not.toStrictEqual(
							message.subarray(0, 16),
						);

						// MAC
						expect(encrypted.subarray(encrypted.length - 32).length).toBe(32);

						// Encrypted message cannot be the same as the message
						expect(
							encrypted.subarray(16, encrypted.length - 32),
						).not.toStrictEqual(message);

						done();
					} catch (err) {
						done(err);
					}
				});

				instance.write(message);
				instance.end();
			});

			it('should encrypt the file stream with pump', async () => {
				const file = Readable.from(Buffer.from('this is a test file'));
				const chunks: Buffer[] = [];
				let size = 0;

				await new Promise<void>((resolve, rejects) => {
					pump(
						file,
						new Transform({
							transform(chunk, encoding, callback) {
								size += chunk.length;
								callback(null, chunk);
							},
						}),
						encryptCTRStream(seed, keys),
						new Transform({
							transform(chunk, encoding, callback) {
								chunks.push(chunk);
								callback();
							},
						}),
						(err: any) => {
							if (err) {
								return rejects(err);
							}

							return resolve();
						},
					);
				});

				const content = Buffer.from('this is a test file');
				const encrypted = Buffer.concat(chunks);

				// IV + encrypted message + MAC
				expect(encrypted.length).toBeGreaterThan(16 + 32);

				// IV cannot be the same as the message
				expect(encrypted.subarray(0, 16)).not.toStrictEqual(
					message.subarray(0, 16),
				);

				// MAC
				expect(encrypted.subarray(encrypted.length - 32).length).toBe(32);

				// Encrypted message cannot be the same as the message
				expect(encrypted.subarray(16, encrypted.length - 32)).not.toStrictEqual(
					message,
				);

				// File size
				expect(size).toBe(content.length);
			});
		});

		describe('decryptStream', () => {
			it('should decrypt data using a stream', done => {
				const encryptStreamInstance = encryptCTRStream(seed, keys);
				const decryptStreamInstance = decryptCTRStream(seed, keys);
				const chunks: Buffer[] = [];

				encryptStreamInstance.pipe(decryptStreamInstance);

				decryptStreamInstance.on('data', chunk => {
					chunks.push(chunk);
				});

				decryptStreamInstance.on('end', () => {
					const decryptedMessage = Buffer.concat(chunks);
					expect(decryptedMessage.toString()).toBe(message.toString());
					done();
				});

				encryptStreamInstance.write(message);
				encryptStreamInstance.end();
			});

			it('should decrypt the file stream with pump', async () => {
				const file = Readable.from(Buffer.from('this is a test file'));
				const encryptedChunks: Buffer[] = [];
				const decryptedChunks: Buffer[] = [];

				// encrypt
				await new Promise<void>((resolve, rejects) => {
					pump(
						file,
						encryptCTRStream(seed, keys),
						new Transform({
							transform(chunk, encoding, callback) {
								encryptedChunks.push(chunk);
								callback();
							},
						}),
						(err: any) => {
							if (err) {
								return rejects(err);
							}

							return resolve();
						},
					);
				});

				const encrypted = Buffer.concat(encryptedChunks);

				// decrypt
				await new Promise<void>((resolve, rejects) => {
					pump(
						Readable.from(encrypted),
						decryptCTRStream(seed, keys),
						new Transform({
							transform(chunk, encoding, callback) {
								decryptedChunks.push(chunk);
								callback();
							},
						}),
						(err: any) => {
							if (err) {
								return rejects(err);
							}

							return resolve();
						},
					);
				});

				const decrypted = Buffer.concat(decryptedChunks);

				expect(encrypted).not.toStrictEqual(decrypted);
				expect(decrypted.toString()).toBe('this is a test file');
			});
		});
	});
});
