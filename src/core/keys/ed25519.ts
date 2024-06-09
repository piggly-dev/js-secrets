import * as elliptic from 'elliptic';

// eslint-disable-next-line new-cap
const ed = new (elliptic as any).default.eddsa('ed25519');

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
