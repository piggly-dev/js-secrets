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
	coveragePathIgnorePatterns: ['./node_modules/', './tests/', './debug', './build'],
	coverageReporters: ['json-summary', 'text', 'lcov'],
	transform: {
		'^.+\\.(mt|t|cj|j)s$': [
			'babel-jest',
			{
				configFile: './babel.jest.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	moduleNameMapper: {
		'@/(.*)\\.js': '<rootDir>/src/$1',
		'#/(.*)\\.js': '<rootDir>/tests/$1',
		'@/(.*)': '<rootDir>/src/$1',
		'#/(.*)': '<rootDir>/tests/$1',
	},
	moduleDirectories: ['node_modules', '<rootDir>/src'],
};
