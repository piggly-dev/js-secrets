export type AvailableHashingAlgorithm =
	| 'sha3-256'
	| 'sha3-512'
	| 'blake2b'
	| 'sha256'
	| 'sha512';

export type AvailableKDF = 'pbkdf2' | 'bcrypt' | 'scrypt';

export type AvailableKeyPairAlgorithm = 'ed25519';

export type AvailableMnemonicLanguage =
	| 'chinese_traditional'
	| 'chinese_simplified'
	| 'portuguese'
	| 'japanese'
	| 'italian'
	| 'spanish'
	| 'english'
	| 'korean'
	| 'french'
	| 'czech';

export type GenerateKDFWithBcryptOptions = Partial<{
	salt_length: number;
}>;

export type GenerateKDFWithPBKDF2Options = Partial<{
	iterations: number;
	key_length: number;
	salt_length: number;
}>;

export type GenerateKDFWithScryptOptions = Partial<{
	block_size: number;
	cost: number;
	key_length: number;
	parallelization: number;
	salt_length: number;
}>;

export type GenerateKeyPairOptions = Partial<{
	mnemonic: GenerateMnemonicOptions;
	seed: GenerateMnemonicSeedOptions;
}>;

export type GenerateMnemonicOptions = Partial<{
	language: AvailableMnemonicLanguage;
	rng: (size: number) => Buffer;
	strength: number;
}>;

export type GenerateMnemonicSeedOptions = Partial<{
	password: string;
}>;

export type GenerateSecretOptions = Partial<{
	seed: GenerateMnemonicSeedOptions;
}>;

export interface IKeyManagerService<KeyType = Buffer> {
	get current_version(): number;
	get(version?: number): KeyType;
	load(index_name?: string): Promise<true>;
	get name(): string;
}

export type VersionedKey = { file: string; name: string; version: number };

export type VersionedKeyPair = {
	name: string;
	pk: string;
	sk: string;
	version: number;
};
