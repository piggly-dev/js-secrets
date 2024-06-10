#!/usr/bin/env node
import { Command } from 'commander';

import {
	generateEd25519KeyPairCommand,
	recoverEd25519KeyPairCommand,
} from '@/bin/commands/keys/ed25519';
import {
	generateAES256SecretCommand,
	recoverAES256SecretCommand,
} from '@/bin/commands/secrets/aes256';
import { generateMnemonic } from '@/bin/commands/mnemonic';

const program = new Command();

const commands = [
	generateMnemonic,
	generateEd25519KeyPairCommand,
	recoverEd25519KeyPairCommand,
	generateAES256SecretCommand,
	recoverAES256SecretCommand,
];

commands.forEach(c => c(program));

program.parse();
