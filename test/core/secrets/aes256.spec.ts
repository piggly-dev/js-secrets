import { Transform, Readable } from 'stream';
import crypto from 'crypto';
import pump from 'pump';

import {
	generateSecret,
	concatSecrets,
	prepareSecret,
	prepareEncryption,
	encrypt,
	encryptStream,
	decrypt,
	decryptStream,
} from '@/core/secrets/aes256';

describe('core -> secrets -> aes256', () => {
	const seed = crypto.randomBytes(64); // master key
	const message = Buffer.from('test message');
	const keys = [crypto.randomBytes(32), crypto.randomBytes(32)]; // random keys

	describe('generateSecret', () => {
		it('should generate a 32-byte secret from a seed', () => {
			const secret = generateSecret(seed);
			expect(secret).toBeInstanceOf(Buffer);
			expect(secret.length).toBe(32);
		});
	});

	describe('concatSecrets', () => {
		it('should concatenate secrets and return a 32-byte hash', () => {
			const secrets = [seed, ...keys];
			const concat = concatSecrets(secrets);

			expect(concat).toBeInstanceOf(Buffer);
			expect(concat.length).toBe(32);
		});
	});

	describe('prepareSecret', () => {
		it('should throw an error if the secret is not 32 bytes long', () => {
			expect(() => prepareSecret(Buffer.from('short secret'))).toThrow(
				'Secret must be at least 32 bytes long.'
			);
		});

		it('should throw an error if any of the keys are not 32 bytes long', () => {
			expect(() => prepareSecret(seed, [Buffer.from('short key')])).toThrow(
				'Keys must be at least 32 bytes long.'
			);
		});

		it('should prepare and concatenate the secret and keys', () => {
			const preparated = prepareSecret(seed, keys);
			expect(preparated).toBeInstanceOf(Buffer);
			expect(preparated.length).toBe(32);
		});
	});

	describe('prepareEncryption', () => {
		it('should prepare encryption parameters', () => {
			const { sk, iv } = prepareEncryption(seed, keys);
			expect(sk).toBeInstanceOf(Buffer);
			expect(sk.length).toBe(32);
			expect(iv).toBeInstanceOf(Buffer);
			expect(iv.length).toBe(16);
		});
	});

	describe('encrypt', () => {
		it('should encrypt a message', () => {
			const encrypted = encrypt(seed, message, keys);
			expect(encrypted).toBeInstanceOf(Buffer);
			expect(encrypted.length).toBeGreaterThan(16); // IV + encrypted message
			expect(encrypted).not.toStrictEqual(message);
			expect(encrypted.toString()).not.toEqual('test message');
		});
	});

	describe('decrypt', () => {
		it('should decrypt a message', () => {
			const encrypted = encrypt(seed, message, keys);
			const decrypted = decrypt(seed, encrypted, keys);
			expect(decrypted).toStrictEqual(message);
			expect(decrypted.toString()).toBe('test message');
		});

		it('should throw an error if the secret is not 32 bytes long', () => {
			expect(() => decrypt(Buffer.from('short secret'), Buffer.from(''))).toThrow(
				'Secret must be at least 32 bytes long.'
			);
		});

		it('should throw an error if any of the keys are not 32 bytes long', () => {
			expect(() =>
				decrypt(seed, Buffer.from(''), [Buffer.from('short key')])
			).toThrow('Keys must be at least 32 bytes long.');
		});
	});

	describe('encryptStream', () => {
		it('should encrypt data using a stream', done => {
			const instance = encryptStream(seed, keys);
			const chunks: Buffer[] = [];

			instance.on('data', chunk => {
				chunks.push(chunk);
			});

			instance.on('end', () => {
				try {
					const encrypted = Buffer.concat(chunks);
					expect(encrypted.length).toBeGreaterThan(16); // IV + encrypted message
					expect(encrypted.subarray(0, 16)).not.toStrictEqual(
						message.subarray(0, 16)
					); // IV cannot be the same as the message
					expect(encrypted.subarray(16)).not.toStrictEqual(message); // Encrypted message cannot be the same as the message
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
					encryptStream(seed, keys),
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
					}
				);
			});

			const content = Buffer.from('this is a test file');
			const encrypted = Buffer.concat(chunks);

			// IV + encrypted message
			expect(encrypted.length).toBeGreaterThan(16);
			// IV cannot be the same as the message
			expect(encrypted.subarray(0, 16)).not.toStrictEqual(
				content.subarray(0, 16)
			);
			// Encrypted message cannot be the same as the message
			expect(encrypted.subarray(16)).not.toStrictEqual(content);
			// File size
			expect(size).toBe(content.length);
		});
	});

	describe('decryptStream', () => {
		it('should decrypt data using a stream', done => {
			const encryptStreamInstance = encryptStream(seed, keys);
			const decryptStreamInstance = decryptStream(seed, keys);
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
					encryptStream(seed, keys),
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
					}
				);
			});

			const encrypted = Buffer.concat(encryptedChunks);

			// decrypt
			await new Promise<void>((resolve, rejects) => {
				pump(
					Readable.from(encrypted),
					decryptStream(seed, keys),
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
					}
				);
			});

			const decrypted = Buffer.concat(decryptedChunks);

			expect(encrypted).not.toStrictEqual(decrypted);
			expect(decrypted.toString()).toBe('this is a test file');
		});
	});
});
