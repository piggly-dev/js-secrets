import { sha512_256 } from '@noble/hashes/sha512';
import { ed25519 } from '@noble/curves/ed25519';

export function generateSecret(seed: Buffer): Buffer {
	return Buffer.from(sha512_256(seed));
}

export function generatePublic(sk: Buffer): Buffer {
	return Buffer.from(ed25519.getPublicKey(sk));
}

export function generateKeyPair(seed: Buffer): { sk: Buffer; pk: Buffer } {
	if (seed.length < 32) {
		throw new Error('Seed must be at least 32 bytes long.');
	}

	const sk = generateSecret(seed);

	return {
		sk,
		pk: generatePublic(sk),
	};
}

export function sign(message: Buffer, secret: Buffer): Buffer {
	return Buffer.from(ed25519.sign(message, secret));
}

export function signFromString(message: string, secret: Buffer): Buffer {
	return Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret));
}

export function verify(
	message: Buffer,
	signature: Buffer,
	publicKey: Buffer
): boolean {
	return ed25519.verify(signature, message, publicKey);
}
