import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);

const EdDSA = require('elliptic').eddsa;

const ed = new EdDSA('ed25519');

export function generateKeyPair(seed: Buffer): { sk: Buffer; pk: Buffer } {
	const keys = ed.keyFromSecret(seed);

	return {
		sk: keys.getSecret(),
		pk: Buffer.from(keys.getPublic()),
	};
}

export async function generateSecret(seed: Buffer): Promise<Buffer> {
	return ed.keyFromSecret(seed).getSecret();
}

export async function generatePublic(seed: Buffer): Promise<Buffer> {
	return ed.keyFromSecret(seed).getPublic();
}

export async function sign(message: Buffer, secret: Buffer): Promise<Buffer> {
	return ed.sign(message, secret).toBytes();
}

export async function verify(
	message: Buffer,
	signature: Buffer,
	publicKey: Buffer
): Promise<boolean> {
	return ed.verify(message, signature, publicKey);
}

export function hash(algorithm: string, message: string) {
	return crypto.hash(algorithm, message, 'buffer');
}
