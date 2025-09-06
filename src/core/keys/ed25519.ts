import { ed25519 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hkdf } from '@noble/hashes/hkdf.js';

import {
	derContext1BitString,
	derOctetString,
	derOidEd25519,
	derBitString,
	derIntZero,
	derSeq,
	toPem,
} from '@/utils/pem.js';

/**
 * Generate a secret key from a seed.
 *
 * @param seed - The seed to generate the secret key.
 * @param opts - The options to generate the secret key.
 * @throws {Error} If the seed is less than 32 bytes long.
 * @returns The secret key.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateSecret(
	seed: Buffer,
	opts?: Partial<{ info: Buffer; salt: Buffer }>,
): Buffer {
	if (seed.length < 32) {
		throw new Error('Seed must be at least 32 bytes long.');
	}

	const salt = opts?.salt ?? Buffer.alloc(0);
	const info = opts?.info ?? Buffer.from('ed25519-signing-key/v1', 'utf8');

	return Buffer.from(hkdf(sha256, seed, salt, info, 32));
}

/**
 * Generate a public key from a secret key.
 *
 * @param sk - The secret key to generate the public key.
 * @throws {Error} If the secret key is not 32 bytes long.
 * @returns The public key.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generatePublic(sk: Buffer): Buffer {
	if (sk.length !== 32) {
		throw new Error('Secret key must be 32 bytes long.');
	}

	return Buffer.from(ed25519.getPublicKey(sk));
}

/**
 * Generate a key pair.
 *
 * @param seed - The seed to generate the key pair.
 * @param opts - The options to generate the key pair.
 * @throws {Error} If the seed is less than 32 bytes long.
 * @returns The key pair.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function generateKeyPair(
	seed: Buffer,
	opts?: Partial<{ info: Buffer; salt: Buffer }>,
): { pk: Buffer; sk: Buffer } {
	const sk = generateSecret(seed, opts);

	return {
		pk: generatePublic(sk),
		sk,
	};
}

/**
 * Sign a message.
 *
 * @param message - The message to sign.
 * @param secret - The secret key to sign the message.
 * @throws {Error} If the secret key is not 32 bytes long.
 * @returns The signature.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function sign(message: Buffer, secret: Buffer): Buffer {
	if (secret.length !== 32) {
		throw new Error('Secret key must be 32 bytes long.');
	}

	return Buffer.from(ed25519.sign(message, secret));
}

/**
 * Sign a message.
 *
 * @param message - The message to sign.
 * @param secret - The secret key to sign the message.
 * @throws {Error} If the secret key is not 32 bytes long.
 * @returns The signature.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 * @returns
 */
export function signFromString(message: string, secret: Buffer): Buffer {
	if (secret.length !== 32) {
		throw new Error('Secret key must be 32 bytes long.');
	}

	return Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret));
}

/**
 * Verify a signature.
 *
 * @param message - The message to verify.
 * @param signature - The signature to verify.
 * @param publicKey - The public key to verify.
 * @throws {Error} If the public key is not 32 bytes long.
 * @throws {Error} If the signature is not 64 bytes long.
 * @throws {Error} If cannot verify for any reason.
 * @returns True if the signature is valid, false otherwise.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function verify(
	message: Buffer,
	signature: Buffer,
	publicKey: Buffer,
): boolean {
	if (publicKey.length !== 32) {
		throw new Error('Public key must be 32 bytes long.');
	}

	if (signature.length !== 64) {
		throw new Error('Signature must be 64 bytes long.');
	}

	return ed25519.verify(signature, message, publicKey);
}

/**
 * Verify a signature.
 *
 * @param message - The message to verify.
 * @param signature - The signature to verify.
 * @param publicKey - The public key to verify.
 * @throws {Error} If the public key is not 32 bytes long.
 * @throws {Error} If the signature is not 64 bytes long.
 * @throws {Error} If cannot verify for any reason.
 * @returns True if the signature is valid, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function verifyFromString(
	message: string,
	signature: Buffer,
	publicKey: Buffer,
): boolean {
	if (publicKey.length !== 32) {
		throw new Error('Public key must be 32 bytes long.');
	}

	if (signature.length !== 64) {
		throw new Error('Signature must be 64 bytes long.');
	}

	return ed25519.verify(signature, new TextEncoder().encode(message), publicKey);
}

/**
 * Verify a signature.
 *
 * @param message - The message to verify.
 * @param signature - The signature to verify.
 * @param publicKey - The public key to verify.
 * @returns True if the signature is valid, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function safeVerify(
	message: Buffer,
	signature: Buffer,
	publicKey: Buffer,
): boolean {
	try {
		return verify(message, signature, publicKey);
	} catch {
		return false;
	}
}

/**
 * Verify a signature.
 *
 * @param message - The message to verify.
 * @param signature - The signature to verify.
 * @param publicKey - The public key to verify.
 * @returns True if the signature is valid, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function safeVerifyFromString(
	message: string,
	signature: Buffer,
	publicKey: Buffer,
): boolean {
	try {
		return verifyFromString(message, signature, publicKey);
	} catch {
		return false;
	}
}

/**
 * Export a public key to SPKI PEM format.
 *
 * @param pk - The public key to export.
 * @returns The public key in SPKI PEM format.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function publicToPem(pk: Buffer): string {
	if (pk.length !== 32) {
		throw new Error('Public key must be 32 bytes long.');
	}

	const algorithm = derSeq(derOidEd25519());
	const subjectPublicKey = derBitString(pk);

	return toPem('PUBLIC KEY', derSeq(algorithm, subjectPublicKey));
}

/**
 * Export a private key to PKCS#8 PEM format.
 *
 * @param sk - The secret key to export.
 * @param pk - The public key to export.
 * @throws {Error} If the secret key is not 32 bytes long.
 * @throws {Error} If the public key is not 32 bytes long.
 * @returns The private key in PKCS#8 PEM format.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function secretToPem(sk: Buffer, pk?: Buffer): string {
	if (sk.length !== 32) {
		throw new Error('Secret key must be 32 bytes long.');
	}

	if (pk && pk.length !== 32) {
		throw new Error('Public key must be 32 bytes long.');
	}

	const pub = pk ?? Buffer.from(ed25519.getPublicKey(sk));

	const version = derIntZero();
	const privateKeyAlgorithm = derSeq(derOidEd25519());

	const inner = derOctetString(sk);
	const privateKey = derOctetString(inner);

	const withPublicKey = derContext1BitString(pub);

	return toPem(
		'PRIVATE KEY',
		derSeq(version, privateKeyAlgorithm, privateKey, withPublicKey),
	);
}
