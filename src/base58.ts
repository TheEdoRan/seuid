// Modified code from https://github.com/cbschuld/uuid-base58/blob/master/src/uuid58.ts

import { addHyphens } from "./utils";

export const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bigIntB58AlphabetLength = 58n;

const DecodeInputError = new Error("invalid base58 SEUID provided");
const encodedLength = 22;

export const encodeB58 = (seuid: string) => {
	const u58 = Buffer.alloc(encodedLength);

	// prettier-ignore
	for (
		let i = encodedLength - 1, b = BigInt("0x" + seuid.replaceAll("-", "")); b > 0; i--, b /= bigIntB58AlphabetLength) {
		const b58idx = Number(b % bigIntB58AlphabetLength);
		u58[i] = BASE58_ALPHABET.charCodeAt(b58idx);
	}

	// If first byte is 0, set value to "1", the first valid char in base58 alphabet.
	u58[0] ||= 49; // "1"

	return u58.toString();
};

export const decodeB58 = (seuidBase58: string, throwOnInvalid: boolean = false) => {
	if (seuidBase58.length !== encodedLength) {
		throw DecodeInputError;
	}

	let b = 0n;

	for (let i = 0; i < seuidBase58.length; i++) {
		const b58Idx = BASE58_ALPHABET.indexOf(seuidBase58[i]!);

		if (b58Idx < 0) {
			if (throwOnInvalid) {
				throw DecodeInputError;
			}

			return null;
		}

		b = (b + BigInt(b58Idx)) * (i < seuidBase58.length - 1 ? bigIntB58AlphabetLength : 1n);
	}

	const hex = b.toString(16).padStart(32, "0");

	if (hex.length !== 32) {
		if (throwOnInvalid) {
			throw new Error("invalid hex output length");
		}

		return null;
	}

	return addHyphens(hex);
};
