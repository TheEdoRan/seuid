// Modified code from https://github.com/cbschuld/uuid-base58/blob/master/src/uuid58.ts

import { addHyphens } from "./utils";

export const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const encodeB58 = (seuid: string) => {
	let b = BigInt("0x" + seuid.replaceAll("-", ""));
	let u58 = "";

	do {
		const index = parseInt((b % BigInt(BASE58_ALPHABET.length)).toString(), 10);
		u58 = BASE58_ALPHABET[index] + u58;
		b = b / BigInt(BASE58_ALPHABET.length);
	} while (b > 0);

	// Add "1" at the beginning if string is 21 chars instead of 22.
	return u58.padStart(22, "1");
};

export const decodeB58 = (seuidBase58: string, throwOnInvalid: boolean = false) => {
	const parts = Array.from(seuidBase58).map((x: string) => BASE58_ALPHABET.indexOf(x));

	if (parts.some((inc) => inc < 0)) {
		if (throwOnInvalid) {
			throw new Error("SEUID decodeB58 error: invalid Base58 SEUID provided");
		}

		return null;
	}

	const b = parts.reduce(
		(total, val, index) =>
			(total + BigInt(val)) *
			(index < seuidBase58.length - 1 ? BigInt(BASE58_ALPHABET.length) : BigInt(1)),
		BigInt(0)
	);

	const hex = b.toString(16).padStart(32, "0");

	if (hex.length !== 32) {
		if (throwOnInvalid) {
			throw new Error("SEUID decodeB58 error: invalid hex output length");
		}

		return null;
	}

	return addHyphens(hex);
};
