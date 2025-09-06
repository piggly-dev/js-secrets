import fs from 'node:fs';

/**
 * Create a path if it does not exist.
 *
 * @param abspath
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function createPath(abspath: string) {
	if (fs.existsSync(abspath) === false) {
		fs.mkdirSync(abspath);
	}
}

/**
 * Check if a file exists.
 *
 * @param filename
 * @returns True if the file exists, false otherwise.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export function exists(filename: string) {
	return fs.existsSync(filename);
}

/**
 * Read a file.
 *
 * @param filename
 * @returns The file data.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function readFile(filename: string): Promise<Buffer> {
	return new Promise<Buffer>((res, rej) => {
		fs.readFile(filename, (err, data) => {
			if (err) {
				return rej(err);
			}

			return res(data);
		});
	});
}

/**
 * Remove a file.
 *
 * @param filename
 * @returns The filename.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function removeFile(filename: string): Promise<string> {
	return new Promise<string>(res => {
		fs.unlink(filename, err => {
			if (err) {
				return res(filename);
			}

			return res(filename);
		});
	});
}

/**
 * Write data to a file.
 *
 * @param filename
 * @param data
 * @returns The filename.
 * @since 0.1.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export async function writeFile(
	filename: string,
	data: Buffer | string,
): Promise<string> {
	return new Promise<string>((res, rej) => {
		fs.writeFile(filename, data, err => {
			if (err) {
				return rej(err);
			}

			return res(filename);
		});
	});
}
