import crypto from 'node:crypto';

import argon2 from 'argon2';

/**
 * Compare a plain text password with a hashed password.
 *
 * @param plain - The plain text password to compare.
 * @param hash - The hashed password to compare.
 * @param opts - The options to compare the password.
 * @param opts.supress_errors - Supress errors if true.
 * @throws {Error} If the password cannot be compared. Only if `opts.supress_errors` is false.
 * @returns True if the password is correct, false otherwise.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function compare(
	plain: string,
	hash: string,
	opts: Partial<{ supress_errors: boolean }> = { supress_errors: true },
): Promise<boolean> {
	try {
		return await argon2.verify(hash, plain);
	} catch (error) {
		if (opts?.supress_errors) {
			return false;
		}

		throw error;
	}
}

/**
 * Hash a plain text password.
 *
 * Default options:
 * - type: argon2id
 * - memoryCost: 128 * 1024
 * - timeCost: 3
 * - parallelism: 1
 * - hashLength: 32
 * - salt: random bytes(16)
 *
 * @param plain - The plain text password to hash.
 * @param options - The options to hash the password.
 * @throws {Error} If the password cannot be hashed.
 * @returns The hashed password.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function hash(
	plain: string,
	options?: Partial<argon2.Options>,
): Promise<string> {
	return argon2.hash(plain, {
		...options,
		hashLength: options?.hashLength ?? 32,
		memoryCost: options?.memoryCost ?? 128 * 1024,
		parallelism: options?.parallelism ?? 1,
		salt: options?.salt ?? crypto.randomBytes(16),
		timeCost: options?.timeCost ?? 3,
		type: options?.type ?? argon2.argon2id,
	});
}
