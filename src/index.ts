import {
	prepareEncryption as prepareEncryptionAES256,
	generateSecret as generateSecretAES256,
	concatSecrets as concatSecretsAES256,
	prepareSecret as prepareSecretAES256,
	encryptStream as encryptStreamAES256,
	decryptStream as decryptStreamAES256,
	encrypt as encryptAES256,
	decrypt as decryptAES256,
} from '@/core/secrets/aes256.js';
import {
	generateKeyPair as generateKeyPairEd25519,
	generateSecret as generateSecretEd25519,
	generatePublic as generatePublicEd25519,
	signFromString as signFromStringEd25519,
	verify as verifyEd25519,
	sign as signEd25519,
} from '@/core/keys/ed25519.js';
import {
	bufferToString,
	stringToBuffer,
	bufferToHex,
	cutBuffer,
	mnemonic,
	seed,
	hash,
} from '@/utils/index.js';

export { AbstractKeyManagerService } from '@/core/services/AbstractKeyManagerService.js';
export { KeyPairManagerService } from '@/core/services/KeyPairManagerService.js';
export { SecretManagerService } from '@/core/services/SecretManagerService.js';

export const ed25519 = {
	generateKeyPair: generateKeyPairEd25519,
	generatePublic: generatePublicEd25519,
	generateSecret: generateSecretEd25519,
	sign: signEd25519,
	signFromString: signFromStringEd25519,
	verify: verifyEd25519,
};

export const aes256 = {
	concatSecrets: concatSecretsAES256,
	decrypt: decryptAES256,
	decryptStream: decryptStreamAES256,
	encrypt: encryptAES256,
	encryptStream: encryptStreamAES256,
	generateSecret: generateSecretAES256,
	prepareEncryption: prepareEncryptionAES256,
	prepareSecret: prepareSecretAES256,
};

export const utils = {
	bufferToHex,
	bufferToString,
	cutBuffer,
	hash,
	mnemonic,
	seed,
	stringToBuffer,
};

export type {
	GenerateMnemonicSeedOptions,
	AvailableMnemonicLanguage,
	AvailableKeyPairAlgorithm,
	GenerateMnemonicOptions,
	GenerateKeyPairOptions,
	GenerateSecretOptions,
	IKeyManagerService,
	VersionedKeyPair,
	VersionedKey,
} from '@/types/index.js';
