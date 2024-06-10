const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DIST_DIR = './dist/types';

const fileExists = filePath => {
	try {
		return fs.existsSync(filePath);
	} catch (err) {
		return false;
	}
};

const resolvePath = importPath => {
	const filePath = path.resolve(DIST_DIR, importPath);

	if (fileExists(`${filePath}/index.d.ts`)) {
		return `${importPath}/index.js`;
	}

	return `${importPath}.js`;
};

const fixPaths = content => {
	return content.replace(/from '(\.[^']+)'/g, (match, p1) => {
		const newPath = resolvePath(p1);
		return `from '${newPath}'`;
	});
};

glob(`${DIST_DIR}/**/*.d.ts`, (err, files) => {
	if (err) {
		console.error('Error while finding .d.ts files:', err);
		return;
	}

	files.forEach(file => {
		fs.readFile(file, 'utf8', (err, content) => {
			if (err) {
				console.error('Error when trying to read file:', file, err);
				return;
			}

			const fixedContent = fixPaths(content);

			fs.writeFile(file, fixedContent, 'utf8', err => {
				if (err) {
					console.error('Error while writing on file:', file, err);
				} else {
					console.log(`Fixed paths ${file}`);
				}
			});
		});
	});
});
