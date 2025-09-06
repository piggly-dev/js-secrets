import bcrypt from 'bcrypt';

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
	return new Promise<boolean>((resolve, reject) => {
		bcrypt.compare(plain, hash, (err, result) => {
			if (err) {
				if (opts?.supress_errors) {
					return resolve(false);
				}

				return reject(err);
			}

			return resolve(result);
		});
	});
}

/**
 * Hash a plain text password.
 *
 * @param plain - The plain text password to hash.
 * @param salt - The salt to use.
 * @throws {Error} If the password cannot be hashed.
 * @returns The hashed password.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function hash(plain: string, salt: number = 12): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		bcrypt.hash(plain, salt, (err, hash) => {
			if (err) {
				return reject(err);
			}

			return resolve(hash);
		});
	});
}
