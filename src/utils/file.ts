import fs from 'fs';

export function createPath(abspath: string) {
	if (fs.existsSync(abspath) === false) {
		fs.mkdirSync(abspath);
	}
}

export function exists(filename: string) {
	return fs.existsSync(filename);
}

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

export async function writeFile(
	filename: string,
	data: Buffer | string
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
