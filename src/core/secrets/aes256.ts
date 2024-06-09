import { Transform, TransformCallback } from 'stream';
import crypto from 'crypto';

export function generateSecret(seed: Buffer): Buffer {
	return crypto.createHash('sha256').update(seed.subarray(0, 32)).digest();
}

export function concatSecrets(secrets: Array<Buffer>): Buffer {
	return crypto
		.createHash('sha256')
		.update(Buffer.concat(secrets))
		.digest()
		.subarray(0, 32);
}

export function prepareSecret(secret: Buffer, keys: Array<Buffer> = []) {
	if (secret.length !== 32) {
		throw Error('Secret must be 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length !== 32)) {
		throw Error('Keys must be 32 bytes long.');
	}

	return concatSecrets([secret, ...keys]);
}

export function prepareEncryption(
	secret: Buffer,
	keys: Array<Buffer> = []
): { sk: Buffer; iv: Buffer; cipher: crypto.Cipher } {
	const sk = prepareSecret(secret, keys);
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv('aes-256-ctr', sk, iv);

	return { sk, iv, cipher };
}

export function encrypt(
	secret: Buffer,
	message: Buffer,
	keys: Array<Buffer> = []
): Buffer {
	const { iv, cipher } = prepareEncryption(secret, keys);
	const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);

	return Buffer.concat([iv, encrypted]);
}

export function encryptStream(secret: Buffer, keys: Array<Buffer> = []): Transform {
	const { iv, cipher } = prepareEncryption(secret, keys);

	const transform = new Transform({
		transform(
			this: Transform,
			chunk: any,
			encoding: BufferEncoding,
			callback: TransformCallback
		): void {
			this.push(iv);
			this._transform = cipher._transform.bind(cipher);
			this._flush = cipher._flush.bind(cipher);

			cipher._transform(chunk, encoding, callback);
		},
	});

	return transform;
}

export function decrypt(
	secret: Buffer,
	message: Buffer,
	keys: Array<Buffer> = []
): Buffer {
	if (secret.length !== 32) {
		throw Error('Secret must be 32 bytes long.');
	}

	if (keys.length > 0 && keys.some(key => key.length !== 32)) {
		throw Error('Keys must be 32 bytes long.');
	}

	const sk = concatSecrets([secret, ...keys]);
	const iv = message.subarray(0, 16);
	const encrypted = message.subarray(16);

	const decipher = crypto.createDecipheriv('aes-256-ctr', sk, iv);
	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

	return decrypted;
}

export function decryptStream(secret: Buffer, keys: Array<Buffer> = []): Transform {
	const sk = prepareSecret(secret, keys);

	let iv: Buffer | null = null;
	let decipher: crypto.Decipher | null = null;

	const transform = new Transform({
		transform(chunk, encoding, callback) {
			if (!iv) {
				iv = chunk.slice(0, 16);
				decipher = crypto.createDecipheriv('aes-256-ctr', sk, iv);
				callback(null, decipher.update(chunk.slice(16)));
				return;
			}

			if (decipher !== null) {
				callback(null, decipher.update(chunk));
			}
		},
		flush(callback) {
			if (decipher) {
				callback(null, decipher.final());
				return;
			}

			callback();
		},
	});

	return transform;
}
