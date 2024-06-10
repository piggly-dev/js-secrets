import {
	generateSecret as generateSecretAES256,
	concatSecrets as concatSecretsAES256,
	prepareSecret as prepareSecretAES256,
	prepareEncryption as prepareEncryptionAES256,
	encrypt as encryptAES256,
	encryptStream as encryptStreamAES256,
	decrypt as decryptAES256,
	decryptStream as decryptStreamAES256,
} from '@/core/secrets/aes256';
import {
	generateKeyPair as generateKeyPairEd25519,
	generateSecret as generateSecretEd25519,
	generatePublic as generatePublicEd25519,
	sign as signEd25519,
	signFromString as signFromStringEd25519,
	verify as verifyEd25519,
} from '@/core/keys/ed25519';
import {
	mnemonic,
	seed,
	hash,
	cutBuffer,
	bufferToHex,
	bufferToString,
	stringToBuffer,
} from '@/utils';

export { KeyPairManagerService } from '@/core/services/KeyPairManagerService';
export { AbstractKeyManagerService } from '@/core/services/AbstractKeyManagerService';
export { SecretManagerService } from '@/core/services/SecretManagerService';

export const ed25519 = {
	generateKeyPair: generateKeyPairEd25519,
	generateSecret: generateSecretEd25519,
	generatePublic: generatePublicEd25519,
	sign: signEd25519,
	signFromString: signFromStringEd25519,
	verify: verifyEd25519,
};

export const aes256 = {
	generateSecret: generateSecretAES256,
	concatSecrets: concatSecretsAES256,
	prepareSecret: prepareSecretAES256,
	prepareEncryption: prepareEncryptionAES256,
	encrypt: encryptAES256,
	encryptStream: encryptStreamAES256,
	decrypt: decryptAES256,
	decryptStream: decryptStreamAES256,
};

export const utils = {
	mnemonic,
	seed,
	hash,
	cutBuffer,
	bufferToHex,
	bufferToString,
	stringToBuffer,
};

export type {
	AvailableMnemonicLanguage,
	GenerateMnemonicOptions,
	GenerateMnemonicSeedOptions,
	AvailableKeyPairAlgorithm,
	GenerateKeyPairOptions,
	GenerateSecretOptions,
	VersionedKey,
	VersionedKeyPair,
	IKeyManagerService,
} from '@/types';
