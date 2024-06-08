export type AvailableMnemonicLanguage =
	| 'czech'
	| 'chinese_simplified'
	| 'chinese_traditional'
	| 'korean'
	| 'french'
	| 'italian'
	| 'spanish'
	| 'japanese'
	| 'portuguese'
	| 'english';

export type GenerateMnemonicOptions = Partial<{
	strength: number;
	rng: (size: number) => Buffer;
	language: AvailableMnemonicLanguage;
}>;

export type GenerateMnemonicSeedOptions = Partial<{
	password: string;
}>;

export type AvailableHashingAlgorithm =
	| 'sha256'
	| 'sha512'
	| 'sha3-256'
	| 'sha3-512'
	| 'blake2b';

export type AvailableKDF = 'pbkdf2' | 'bcrypt' | 'scrypt';

export type GenerateKeyWithPBKDF2Options = Partial<{
	iterations: number;
	key_length: number;
	salt_length: number;
}>;

export type GenerateKeyWithBcryptOptions = Partial<{
	salt_length: number;
}>;

export type GenerateKeyWithScryptOptions = Partial<{
	cost: number;
	block_size: number;
	parallelization: number;
	key_length: number;
	salt_length: number;
}>;

export type VersionedKey = { file: string; name: string; version: number };
