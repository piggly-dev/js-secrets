import { TransformCallback, Transform } from 'node:stream';
import crypto from 'node:crypto';

/**
 * Derive an encryption key from a secret and keys.
 *
 * @param secret - The secret to derive the key from.
 * @param keys - The keys to derive the key from.
 * @returns The derived key.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function deriveGCMEncryptionKey(secret: Buffer, keys: Buffer[] = []): Buffer {
	return Buffer.from(
		crypto.hkdfSync(
			'sha256',
			Buffer.alloc(0),
			Buffer.concat([secret, ...keys]),
			Buffer.from('aes-256-gcm/enc/v1'),
			32,
		),
	);
}

/**
 * Prepare encryption.
 *
 * @param secret
 * @param keys
 * @throws {Error} If the secret is less than 32 bytes long.
 * @throws {Error} If any of the keys are less than 32 bytes long.
 * @returns The cipher, IV, and secret.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 * @returns
 * @returns
 */
export function getCipherGCM(
	secret: Buffer,
	keys: Array<Buffer> = [],
): { cipher: crypto.CipherGCM; iv: Buffer } {
	const key = deriveGCMEncryptionKey(secret, keys);
	const iv = crypto.randomBytes(12); // @note 96-bit IV recommended
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

	return { cipher, iv };
}

/**
 * Encrypt a message using AES-256-GCM.
 *
 * @param secret - The secret to encrypt.
 * @param message - The message to encrypt.
 * @param keys - The keys to encrypt.
 * @param aad - The additional authentication data.
 * @returns The encrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function encryptGCM(
	secret: Buffer,
	message: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Buffer {
	if (secret.length < 32) {
		throw Error('Secret must be at least 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length < 32)) {
		throw Error('Keys must be at least 32 bytes long.');
	}

	const { cipher, iv } = getCipherGCM(secret, keys);

	if (aad) {
		cipher.setAAD(aad);
	}

	const ct = Buffer.concat([cipher.update(message), cipher.final()]);
	const tag = cipher.getAuthTag();

	return Buffer.concat([iv, ct, tag]);
}

/**
 * Decrypt a message using AES-256-GCM.
 *
 * @param secret - The secret to decrypt.
 * @param blob - The message to decrypt.
 * @param keys - The keys to decrypt.
 * @param aad - The additional authentication data.
 * @returns The decrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function decryptGCM(
	secret: Buffer,
	blob: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Buffer {
	if (secret.length < 32) {
		throw Error('Secret must be at least 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length < 32)) {
		throw Error('Keys must be at least 32 bytes long.');
	}

	if (blob.length < 12 + 16) {
		throw Error('Blob must be at least 12+16 bytes long.');
	}

	const key = deriveGCMEncryptionKey(secret, keys);
	const iv = blob.subarray(0, 12);
	const tag = blob.subarray(blob.length - 16);
	const ct = blob.subarray(12, blob.length - 16);

	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

	if (aad) {
		decipher.setAAD(aad);
	}

	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/**
 * Encrypt a message using AES-256-GCM.
 *
 * @param secret - The secret to encrypt.
 * @param keys - The keys to encrypt.
 * @param aad - The additional authentication data.
 * @returns The encrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function encryptGCMStream(
	secret: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Transform {
	const { cipher, iv } = getCipherGCM(secret, keys);

	if (aad) {
		cipher.setAAD(aad);
	}

	let ivPushed = false;

	const transform = new Transform({
		flush(callback) {
			this.push(cipher.final());
			this.push(cipher.getAuthTag());
			callback();
		},
		transform(
			this: Transform,
			chunk: any,
			encoding: BufferEncoding,
			callback: TransformCallback,
		): void {
			if (!ivPushed) {
				this.push(iv);
				ivPushed = true;
			}

			this.push(cipher.update(chunk));
			callback();
		},
	});

	return transform;
}

/**
 * Decrypt a message using AES-256-GCM.
 *
 * @param secret - The secret to decrypt.
 * @param keys - The keys to decrypt.
 * @param aad - The additional authentication data.
 * @returns The decrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function decryptGCMStream(
	secret: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Transform {
	const key = deriveGCMEncryptionKey(secret, keys);

	let iv: Buffer | null = null;
	let decipher: crypto.DecipherGCM | null = null;
	let tail = Buffer.alloc(0);

	const transform = new Transform({
		flush(callback) {
			if (!decipher || !iv || tail.length !== 16) {
				return callback(new Error('Malformed ciphertext (missing tag).'));
			}

			try {
				decipher.setAuthTag(tail);
				this.push(decipher.final());
				callback();
			} catch (e) {
				callback(e as Error);
			}
		},
		transform(chunk, encoding, callback) {
			let data = chunk;

			if (!iv) {
				if (tail.length) {
					data = Buffer.concat([tail, chunk]);
					tail = Buffer.alloc(0);
				}

				if (data.length < 12) {
					tail = data;
					return callback();
				}

				iv = data.subarray(0, 12);
				decipher = crypto.createDecipheriv(
					'aes-256-gcm',
					key,
					iv,
				) as crypto.DecipherGCM;

				if (aad) {
					decipher.setAAD(aad);
				}

				data = data.subarray(12);
			}

			const total = Buffer.concat([tail, data]);

			if (total.length <= 16) {
				tail = total;
				return callback();
			}

			const feed = total.subarray(0, total.length - 16);
			tail = total.subarray(total.length - 16);

			this.push(decipher!.update(feed));
			callback();
		},
	});

	return transform;
}

/**
 * Derive an encryption key from a secret and keys.
 *
 * @param secret
 * @param keys
 * @returns The derived key.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function deriveCTREncryptionKey(
	secret: Buffer,
	keys: Buffer[] = [],
): { k_enc: Buffer; k_mac: Buffer } {
	if (secret.length < 32) {
		throw Error('Secret must be at least 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length < 32)) {
		throw Error('Keys must be at least 32 bytes long.');
	}

	const ikm = Buffer.concat([secret, ...keys]);

	return {
		k_enc: Buffer.from(
			crypto.hkdfSync(
				'sha256',
				Buffer.alloc(0),
				ikm,
				Buffer.from('aes-256-ctr/enc/v1'),
				32,
			),
		),
		k_mac: Buffer.from(
			crypto.hkdfSync(
				'sha256',
				Buffer.alloc(0),
				ikm,
				Buffer.from('hmac-sha256/mac/v1'),
				32,
			),
		),
	};
}

/**
 * Prepare encryption.
 *
 * @param secret
 * @param keys
 * @throws {Error} If the secret is less than 32 bytes long.
 * @throws {Error} If any of the keys are less than 32 bytes long.
 * @returns The cipher, IV, and secret.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 * @returns
 * @returns
 */
export function getCipherCTR(
	secret: Buffer,
	keys: Array<Buffer> = [],
): { cipher: crypto.Cipheriv; iv: Buffer; k_enc: Buffer; k_mac: Buffer } {
	const { k_enc, k_mac } = deriveCTREncryptionKey(secret, keys);

	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv('aes-256-ctr', k_enc, iv);

	return { cipher, iv, k_enc, k_mac };
}

/**
 * Encrypt a message using AES-256-CTR.
 *
 * @param secret - The secret to encrypt.
 * @param message - The message to encrypt.
 * @param keys - The keys to encrypt.
 * @param aad - The additional authentication data.
 * @returns The encrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function encryptCTR(
	secret: Buffer,
	message: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Buffer {
	const { cipher, iv, k_mac } = getCipherCTR(secret, keys);
	const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);

	return Buffer.concat([
		iv,
		encrypted,
		crypto
			.createHmac('sha256', k_mac)
			.update(iv)
			.update(aad ?? Buffer.alloc(0))
			.update(encrypted)
			.digest(),
	]);
}

/**
 * Decrypt a message using AES-256-CTR.
 *
 * @param secret
 * @param blob - The message to decrypt.
 * @param keys - The keys to decrypt.
 * @returns The decrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function decryptCTR(
	secret: Buffer,
	blob: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Buffer {
	if (secret.length < 32) {
		throw Error('Secret must be at least 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length < 32)) {
		throw Error('Keys must be at least 32 bytes long.');
	}

	const { k_enc, k_mac } = deriveCTREncryptionKey(secret, keys);

	const iv = blob.subarray(0, 16);
	const tag = blob.subarray(blob.length - 32);
	const encrypted = blob.subarray(16, blob.length - 32);
	const mac = crypto
		.createHmac('sha256', k_mac)
		.update(iv)
		.update(aad ?? Buffer.alloc(0))
		.update(encrypted)
		.digest();

	if (mac.length !== tag.length || !crypto.timingSafeEqual(mac, tag)) {
		throw Error('Invalid MAC');
	}

	const decipher = crypto.createDecipheriv('aes-256-ctr', k_enc, iv);
	return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Encrypt a message using AES-256-CTR.
 *
 * @param secret - The secret to encrypt.
 * @param keys - The keys to encrypt.
 * @param aad - The additional authentication data.
 * @returns The encrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function encryptCTRStream(
	secret: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Transform {
	const { k_enc, k_mac } = deriveCTREncryptionKey(secret, keys);
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv('aes-256-ctr', k_enc, iv);
	const mac = crypto.createHmac('sha256', k_mac);

	let ivPushed = false;

	mac.update(iv);

	if (aad) {
		mac.update(aad);
	}

	const transform = new Transform({
		flush(callback) {
			try {
				const last = cipher.final();

				if (last.length) {
					this.push(last);
					mac.update(last);
				}

				this.push(mac.digest()); // tag(32)
				callback();
			} catch (e) {
				callback(e as Error);
			}
		},
		transform(
			this: Transform,
			chunk: any,
			encoding: BufferEncoding,
			callback: TransformCallback,
		): void {
			try {
				if (!ivPushed) {
					this.push(iv);
					ivPushed = true;
				}

				const ct = cipher.update(chunk);

				if (ct.length) {
					this.push(ct);
					mac.update(ct);
				}

				callback();
			} catch (e) {
				callback(e as Error);
			}
		},
	});

	return transform;
}

/**
 * Decrypt a message using AES-256-CTR.
 *
 * @param secret - The secret to decrypt.
 * @param keys - The keys to decrypt.
 * @param aad - The additional authentication data.
 * @returns The decrypted message.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function decryptCTRStream(
	secret: Buffer,
	keys: Array<Buffer> = [],
	aad?: Buffer,
): Transform {
	const { k_enc, k_mac } = deriveCTREncryptionKey(secret, keys);
	const mac = crypto.createHmac('sha256', k_mac);

	let iv: Buffer | null = null;
	let decipher: crypto.Decipheriv | null = null;

	let tail = Buffer.alloc(0);
	const mac_buffer: Buffer[] = [];

	if (aad) {
		mac.update(aad);
	}

	const transform = new Transform({
		flush(callback) {
			try {
				if (!iv || !decipher || tail.length !== 32) {
					return callback(
						new Error('Malformed ciphertext: missing IV or tag.'),
					);
				}

				const calc = mac.digest();

				if (calc.length !== tail.length || !crypto.timingSafeEqual(calc, tail)) {
					return callback(new Error('Invalid MAC'));
				}

				mac_buffer.push(decipher.final());

				for (const b of mac_buffer) {
					this.push(b);
				}

				callback();
			} catch (e) {
				callback(e as Error);
			}
		},
		transform(_chunk, encoding, callback) {
			try {
				let chunk = _chunk;

				if (!iv) {
					const combined = Buffer.concat([tail, chunk]);
					if (combined.length < 16) {
						tail = combined;
						return callback();
					}

					iv = combined.subarray(0, 16);
					decipher = crypto.createDecipheriv('aes-256-ctr', k_enc, iv);
					mac.update(iv);

					chunk = combined.subarray(16);
					tail = Buffer.alloc(0);
				}

				const total = Buffer.concat([tail, chunk]);

				if (total.length <= 32) {
					tail = total;
					return callback();
				}

				const feed = total.subarray(0, total.length - 32);
				tail = total.subarray(total.length - 32);

				mac.update(feed);
				mac_buffer.push(decipher!.update(feed));

				callback();
			} catch (e) {
				callback(e as Error);
			}
		},
	});

	return transform;
}

/**
 * Generate a secret FROM a seed WITH SHA-256.
 *
 * @param seed
 * @returns The secret.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateSecret(seed?: Buffer): Buffer {
	return crypto
		.createHash('sha256')
		.update(seed ?? crypto.randomBytes(32))
		.digest();
}
