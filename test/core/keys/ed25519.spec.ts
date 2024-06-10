import {
	generateKeyPair,
	generateSecret,
	generatePublic,
	sign,
	verify,
	signFromString,
} from '@/core/keys/ed25519';

describe('core -> keys -> ed25519', () => {
	const seed = Buffer.from('dP35fDThaWnNQSrj2xCqc48HGebEts9y'); // 32 bits

	describe('generateKeyPair', () => {
		it('should throw an error if seed is less than 32 bytes', () => {
			const shortSeed = Buffer.from('short seed');

			expect(() => generateKeyPair(shortSeed)).toThrow(
				'Seed must be at least 32 bytes long.'
			);
		});

		it('should generate a key pair from a seed', () => {
			const keyPair = generateKeyPair(seed);

			expect(keyPair.sk).toBeInstanceOf(Buffer);
			expect(keyPair.pk).toBeInstanceOf(Buffer);
			expect(keyPair.sk.length).toBe(32);
			expect(keyPair.pk.length).toBe(32);
			expect(keyPair.sk).not.toEqual(keyPair.pk);
			expect(keyPair.sk.toString('hex')).not.toEqual(seed.toString('hex'));
			expect(keyPair.pk.toString('hex')).not.toEqual(seed.toString('hex'));
		});
	});

	describe('generateSecret', () => {
		it('should generate a secret key from a seed', () => {
			const secretKey = generateSecret(seed);

			expect(secretKey).toBeDefined();
			expect(secretKey).toBeInstanceOf(Buffer);
			expect(secretKey.length).toBe(32);
		});
	});

	describe('generatePublic', () => {
		it('should generate a public key from a seed', () => {
			const publicKey = generatePublic(generateSecret(seed));

			expect(publicKey).toBeDefined();
			expect(publicKey).toBeInstanceOf(Buffer);
			expect(publicKey.length).toBe(32);
		});
	});

	describe('generateKeyPair / generateSecret / generatePublic', () => {
		it('should produce same keys', () => {
			const keyPair = generateKeyPair(seed);
			const secretKey = generateSecret(seed);
			const publicKey = generatePublic(generateSecret(seed));

			expect(keyPair.sk).toEqual(secretKey);
			expect(keyPair.pk).toEqual(publicKey);
		});
	});

	describe('sign', () => {
		it('should sign a message with a secret key', () => {
			const message = Buffer.from('test message');
			const secretKey = generateSecret(seed);
			const signature = sign(message, secretKey);

			expect(signature).toBeDefined();
			expect(signature).toBeInstanceOf(Buffer);
		});
	});

	describe('verify', () => {
		it('signature should be the same', () => {
			const keyPair = generateKeyPair(seed);

			expect(sign(Buffer.from('test message'), keyPair.sk)).toStrictEqual(
				signFromString('test message', keyPair.sk)
			);
		});

		it('should verify a signed message with a public key', () => {
			const message = Buffer.from('test message');
			const keyPair = generateKeyPair(seed);
			const signature = sign(message, keyPair.sk);
			const isValid = verify(message, signature, keyPair.pk);

			expect(isValid).toBe(true);
		});

		it('should return false for an invalid signature', () => {
			const message = Buffer.from('test message');
			const invalidMessage = Buffer.from('invalid message');
			const keyPair = generateKeyPair(seed);
			const signature = sign(message, keyPair.sk);
			const isValid = verify(invalidMessage, signature, keyPair.pk);

			expect(isValid).toBe(false);
		});
	});
});
