# Changelog

## `v0.1.0` at `2024-06-10`

* Initial release.

## `v0.2.0` at `2024-06-10`

* Add current version flag to `SecretManagerService` and `KeyPairManagerService`;
* Types exports.

## `v0.3.0` at `2024-06-10`

* Add sourceMap to build.

## `v0.4.0` at `2024-06-10`

* Add `.js` extension to `.d.ts` files.

## `v0.5.0` at `2024-06-10`

* Change behavior for Services manager.

## `v0.6.0` at `2025-09-06`

* Overall enhancements to the library.

## `v0.7.0` at `2026-01-01`

* Dependencies udpated.

## `v0.8.0` at `2026-01-02`

* Dependencies udpated.
* Migrate from `bip39` to `@scure/bip39`;
* Using `hkdf` from `@noble/hashes` when generating secrets.

> **Note:** Starting with v0.8.0, all deterministic secrets generated with `aes256.generateSecret` are now different from the previous version. You should use the "version: 1" flag to keep compatibility.
