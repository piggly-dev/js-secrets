import {
	deriveGCMEncryptionKey as deriveGCMEncryptionKeyAES256,
	deriveCTREncryptionKey as deriveCTREncryptionKeyAES256,
	encryptGCMStream as encryptGCMStreamAES256,
	decryptGCMStream as decryptGCMStreamAES256,
	encryptCTRStream as encryptCTRStreamAES256,
	decryptCTRStream as decryptCTRStreamAES256,
	generateSecret as generateSecretAES256,
	getCipherGCM as getCipherGCMAES256,
	getCipherCTR as getCipherCTRAES256,
	encryptGCM as encryptGCMAES256,
	decryptGCM as decryptGCMAES256,
	encryptCTR as encryptCTRAES256,
	decryptCTR as decryptCTRAES256,
} from '@/core/secrets/aes256.js';
import {
	safeVerifyFromString as safeVerifyFromStringEd25519,
	verifyFromString as verifyFromStringEd25519,
	generateKeyPair as generateKeyPairEd25519,
	generateSecret as generateSecretEd25519,
	generatePublic as generatePublicEd25519,
	signFromString as signFromStringEd25519,
	publicToPem as publicToPemEd25519,
	secretToPem as secretToPemEd25519,
	safeVerify as safeVerifyEd25519,
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
import {
	compare as compareArgon2,
	hash as hashArgon2,
} from '@/core/passwords/argon2.js';
import {
	compare as compareBcrypt,
	hash as hashBcrypt,
} from '@/core/passwords/bcrypt.js';

export { AbstractKeyManagerService } from '@/core/services/AbstractKeyManagerService.js';
export { KeyPairManagerService } from '@/core/services/KeyPairManagerService.js';
export { SecretManagerService } from '@/core/services/SecretManagerService.js';

export const ed25519 = {
	generateKeyPair: generateKeyPairEd25519,
	generatePublic: generatePublicEd25519,
	generateSecret: generateSecretEd25519,
	publicToPem: publicToPemEd25519,
	safeVerify: safeVerifyEd25519,
	safeVerifyFromString: safeVerifyFromStringEd25519,
	secretToPem: secretToPemEd25519,
	sign: signEd25519,
	signFromString: signFromStringEd25519,
	verify: verifyEd25519,
	verifyFromString: verifyFromStringEd25519,
};

export const bcrypt = {
	compare: compareBcrypt,
	hash: hashBcrypt,
};

export const argon2 = {
	compare: compareArgon2,
	hash: hashArgon2,
};

export const aes256 = {
	decryptCTR: decryptCTRAES256,
	decryptCTRStream: decryptCTRStreamAES256,
	decryptGCM: decryptGCMAES256,
	decryptGCMStream: decryptGCMStreamAES256,
	deriveCTREncryptionKey: deriveCTREncryptionKeyAES256,
	deriveGCMEncryptionKey: deriveGCMEncryptionKeyAES256,
	encryptCTR: encryptCTRAES256,
	encryptCTRStream: encryptCTRStreamAES256,
	encryptGCM: encryptGCMAES256,
	encryptGCMStream: encryptGCMStreamAES256,
	generateSecret: generateSecretAES256,
	getCipherCTR: getCipherCTRAES256,
	getCipherGCM: getCipherGCMAES256,
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
