# Piggly/Secrets

![Typescript](https://img.shields.io/badge/language-typescript-blue?style=for-the-badge) ![NPM](https://img.shields.io/npm/v/@piggly/secrets?style=for-the-badge) [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=for-the-badge)](LICENSE)

An ESM/CommonJS library for managing secrets in your application. The main goal of this library is to provide terminal commands (with npx) to generate secrets for your application from a mnemonic phrase. To achieve it, a lot of tools are used within micro functions.

## Features

- Generates a mnemonic phrase on terminal, with `npx pglysecrets mnemonic`;
- Generates a key-pair from a mnemonic phrase, with `npx pglysecrets generate:ed25519`;
- Generates a secret key from a mnemonic phrase, with `npx pglysecrets generate:aes256`;
- Recovers a key-pair from a mnemonic phrase, with `npx pglysecrets recover:ed25519`;
- Recovers a secret key from a mnemonic phrase, with `npx pglysecrets recover:aes256`;
- Functions to sign and verify data with `ED25519` in `ed25519.sign` and `ed25519.verify`;
- Functions to encrypt and decrypt data with `AES-256` in `aes256.encrypt`, `aes256.decrypt`, `aes256.encryptStream` and `aes256.decryptStream`;
- Services to manage secrets and key-pairs in your application.

### Commands

#### `pglysecrets mnemonic`

Generates and shows a mnemonic.

##### Usage

```sh
pglysecrets mnemonic [options]
```

##### Options

| Option                          | Description                                                                                                                 | Default | Required |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------|----------|
| `-s, --strength <strength>`     | Strength of mnemonic.                                                                                                        | 128     | No       |
| `-n, --language <language>`     | Language of mnemonic. Available: czech, chinese_simplified, chinese_traditional, korean, french, italian, spanish, japanese, portuguese, english. | english | No       |

##### Example

```sh
pglysecrets mnemonic -s 256 -n japanese
```

#### `pglysecrets generate:ed25519`

Generates a key-pair based on a mnemonic phrase using the ed25519 algorithm.

> The name for a secret key will be `${name}.sk.key` and for a public key will be `${name}.pk.key`.
> When using the index option, the key will be stored in a JSON file with the name `${index}.index.keypairs.json`.

##### Usage

```sh
pglysecrets generate:ed25519 <name> <version> [options]
```

##### Arguments

| Argument    | Description                               | Required |
| ----------- | ----------------------------------------- | -------- |
| `<name>`    | Name of the key.                          | Yes      |
| `<version>` | Version of the key. Should be an integer. | Yes      |

##### Options

| Option                      | Description                                     | Default   | Required |
| --------------------------- | ----------------------------------------------- | --------- | -------- |
| `-p, --path <path>`         | Path to save the key.                           |           | Yes      |
| `-x, --index <index>`       | Index name. Will store the key in a JSON index. |           | No       |
| `-w, --password <password>` | Password for seed generation.                   |           | No       |
| `-l, --language <language>` | Language of mnemonic.                           | `english` | No       |

##### Example

```sh
pglysecrets generate:ed25519 myKey 1 -p /path/to/save -x keyIndex -w myPassword -l japanese
```

#### `pglysecrets recover:ed25519`

Recovers a key-pair from a mnemonic and saves it to a file. It will remove the previous key from the index when the index is set.

> The name for a secret key will be `${name}.sk.key` and for a public key will be `${name}.pk.key`.
> When using the index option, the key will be stored in a JSON file with the name `${index}.index.keypairs.json`.
> ⚠️ It will replace the previous key with the same name and version.

##### Usage

```sh
pglysecrets recover:ed25519 <name> <version> [options]
```

##### Arguments

| Argument   | Description                               | Required |
|------------|-------------------------------------------|----------|
| `<name>`   | Name of the key.                          | Yes      |
| `<version>`| Version of the key. Should be an integer. | Yes      |

##### Options

| Option                          | Description                                                                 | Default  | Required |
|---------------------------------|-----------------------------------------------------------------------------|----------|----------|
| `-p, --path <path>`             | Path to save the key.                                                       |          | Yes      |
| `-x, --index <index>`           | Index name. Will store the key in a JSON index.                             |          | No       |
| `-m, --mnemonic <mnemonic>`     | Mnemonic to recover the key.                                                |          | Yes      |
| `-w, --password <password>`     | Password for seed generation.                                               |          | No       |

##### Example

```sh
pglysecrets recover:ed25519 myKey 1 -p /path/to/save -x keyIndex -m "mnemonic phrase here" -w myPassword
```

#### `pglysecrets generate:aes256`

Generates a secret based on a mnemonic phrase using the aes256 algorithm.

> The name for a secret key will be `${name}.secret.key`.
> When using the index option, the key will be stored in a JSON file with the name `${index}.index.secrets.json`.

##### Usage

```sh
pglysecrets generate:aes256 <name> <version> [options]
```

##### Arguments

| Argument   | Description                          | Required |
|------------|--------------------------------------|----------|
| `<name>`   | Name of the key.                     | Yes      |
| `<version>`| Version of the key. Should be an integer. | Yes      |

##### Options

| Option                          | Description                                                             | Default  | Required |
|---------------------------------|-------------------------------------------------------------------------|----------|----------|
| `-p, --path <path>`             | Path to save the key.                                                   |          | Yes      |
| `-x, --index <index>`           | Index name. Will store the key in a JSON index.                         |          | No       |
| `-w, --password <password>`     | Password for seed generation.                                           |          | No       |
| `-l, --language <language>`     | Language of mnemonic. Available: czech, chinese_simplified, chinese_traditional, korean, french, italian, spanish, japanese, portuguese, english. | english  | No       |

##### Example

```sh
pglysecrets generate:aes256 mySecret 1 -p /path/to/save -x secretIndex -w myPassword -l japanese
```

#### `pglysecrets recover:aes256`

Recovers a secret from a mnemonic and saves it to a file. It will remove the previous key from the index when the index is set.

> The name for a secret key will be `${name}.secret.key`.
> When using the index option, the key will be stored in a JSON file with the name `${index}.index.secrets.json`.
> ⚠️ It will replace the previous key with the same name and version.

##### Usage

```sh
pglysecrets recover:aes256 <name> <version> [options]
```

##### Arguments

| Argument   | Description                          | Required |
|------------|--------------------------------------|----------|
| `<name>`   | Name of the key.                     | Yes      |
| `<version>`| Version of the key. Should be an integer. | Yes      |

##### Options

| Option                          | Description                                                                 | Default  | Required |
|---------------------------------|-----------------------------------------------------------------------------|----------|----------|
| `-p, --path <path>`             | Path to save the key.                                                       |          | Yes      |
| `-x, --index <index>`           | Index name. Will store the key in a JSON index.                             |          | No       |
| `-m, --mnemonic <mnemonic>`     | Mnemonic to recover the key.                                                |          | Yes      |
| `-w, --password <password>`     | Password for seed generation.                                               |          | No       |

##### Example

```sh
pglysecrets recover:aes256 mySecret 1 -p /path/to/save -x secretIndex -m "mnemonic phrase here" -w myPassword
```

## Installation
This library is ready for ES module or CommonJs module. You must add it by using Node.Js:

```bash
npm i --save @piggly/secrets
```

## Changelog

See the [CHANGELOG](CHANGELOG.md) file for information about all code changes.

## Testing the code

This library uses the **Jest**. We carry out tests of all the main features of this application.

```bash
npm run test:once
```

## Contributions

See the [CONTRIBUTING](CONTRIBUTING.md) file for information before submitting your contribution.

## Credits

- [Caique Araujo](https://github.com/caiquearaujo)
- [All contributors](../../contributors)

## License

MIT License (MIT). See [LICENSE](LICENSE).
