// Modified code from https://github.com/cbschuld/uuid-base58/blob/master/src/uuid58.ts

import { addHyphens } from "./utils";

const DecodeInputError = new Error("invalid encoded SEUID provided");

export const encodeSEUID = (seuid: string, characterSet: string, encodedLength: number) => {
	let encoded = "";

	const bigIntCharacterSetLength = BigInt(characterSet.length);

	for (let b = BigInt("0x" + seuid.replaceAll("-", "")); b > 0; b /= bigIntCharacterSetLength) {
		const charsetIdx = Number(b % bigIntCharacterSetLength);
		encoded = characterSet[charsetIdx] + encoded;
	}

	// Fill start of string with the first character of charset.
	return encoded.padStart(encodedLength, characterSet.charAt(0));
};

export const decodeSEUID = (
	encodedSeuid: string,
	characterSet: string,
	encodedLength: number,
	throwOnInvalid: boolean = false
) => {
	if (encodedSeuid.length !== encodedLength) {
		throw DecodeInputError;
	}

	const bigIntCharacterSetLength = BigInt(characterSet.length);

	let b = 0n;

	for (let i = 0; i < encodedSeuid.length; i++) {
		const charsetIdx = characterSet.indexOf(encodedSeuid[i]!);

		if (charsetIdx < 0) {
			if (throwOnInvalid) {
				throw DecodeInputError;
			}

			return null;
		}

		b = (b + BigInt(charsetIdx)) * (i < encodedSeuid.length - 1 ? bigIntCharacterSetLength : 1n);
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
