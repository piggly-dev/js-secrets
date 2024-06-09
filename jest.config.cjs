module.exports = {
	verbose: true,
	rootDir: '.',
	roots: ['<rootDir>/src', '<rootDir>/test'],
	testMatch: ['**/test/*spec.+(ts)', '**/test/**/*spec.+(ts)'],
	collectCoverage: true,
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 60,
			lines: 60,
			statements: 60,
		},
	},
	collectCoverageFrom: ['<rootDir>/src/**/*.{ts}'],
	coveragePathIgnorePatterns: ['./node_modules/', './tests/', './debug', './build'],
	coverageReporters: ['json-summary', 'text', 'lcov'],
	transform: {
		// '^.+\\.(js|jsx|mjs)$': 'babel-jest',
		'^.+\\.(mt|t|cj|j)s$': [
			'ts-jest',
			{
				useESM: true,
				diagnostics: false,
				tsconfig: 'tsconfig.json',
			},
		],
	},
	preset: 'ts-jest',
	moduleFileExtensions: ['ts', 'js'],
	moduleNameMapper: {
		'@/(.*)\\.js': '<rootDir>/src/$1',
		'#/(.*)\\.js': '<rootDir>/tests/$1',
		'@/(.*)': '<rootDir>/src/$1',
		'#/(.*)': '<rootDir>/tests/$1',
	},
	moduleDirectories: ['node_modules', '<rootDir>/src'],
	extensionsToTreatAsEsm: ['.ts'],
};
