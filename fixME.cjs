const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, './dist');

function fixME() {
	fs.readdir(buildDir, function (err, dirs) {
		if (err) {
			throw err;
		}
		dirs.forEach(function (dir) {
			if (dir === 'esm') {
				var packageJsonFile = path.join(buildDir, dir, '/package.json');
				if (!fs.existsSync(packageJsonFile)) {
					fs.writeFile(
						packageJsonFile,
						new Uint8Array(Buffer.from('{"type": "module"}')),
						function (err) {
							if (err) {
								throw err;
							}
						}
					);
				}

				var binFile = path.join(buildDir, dir, '/bin/index.js');
				if (fs.existsSync(binFile)) {
					fs.chmod(binFile, 0o755, function (err) {
						if (err) {
							throw err;
						}

						console.log(`Permissions for ${binFile} set to executable.`);
					});
				}
			}

			if (dir === 'cjs') {
				var packageJsonFile = path.join(buildDir, dir, '/package.json');
				if (!fs.existsSync(packageJsonFile)) {
					fs.writeFile(
						packageJsonFile,
						new Uint8Array(Buffer.from('{"type": "commonjs"}')),
						function (err) {
							if (err) {
								throw err;
							}
						}
					);
				}

				var binFile = path.join(buildDir, dir, '/bin/index.js');
				if (fs.existsSync(binFile)) {
					fs.chmod(binFile, 0o755, function (err) {
						if (err) {
							throw err;
						}

						console.log(`Permissions for ${binFile} set to executable.`);
					});
				}
			}
		});
	});
}

fixME();
