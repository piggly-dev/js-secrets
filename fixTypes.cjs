const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, './dist', 'types');

function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(p);
		else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
			const content = fs.readFileSync(p);
			const base = p.slice(0, -'.d.ts'.length);
			fs.writeFileSync(`${base}.d.mts`, content);
			fs.writeFileSync(`${base}.d.cts`, content);
		}
	}
}
walk(root);
