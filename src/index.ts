import { randomBytes } from "crypto";
import { decodeB58, encodeB58 } from "./base58";
import { SEUID_B58_REGEX, SEUID_REGEX } from "./regexes";
import { addHyphens } from "./utils";

const MAX_RANDOM_BIGINT = 1208925819614629174706175n;
export const MAX_SEUID_TIMESTAMP = 281474976710655;

export class SEUID {
	private lastTimestamp: number;
	private lastRandomPart: string;

	/**
	 * Generate a new SEUID.
	 * @param timestamp A seed for the time part of the SEUID. Max: `281474976710655`
	 */
	generate(timestamp?: number) {
		if (timestamp && timestamp > MAX_SEUID_TIMESTAMP) {
			throw new Error(
				`SEUID generate error: input timestamp exceeds the maximum of ${MAX_SEUID_TIMESTAMP}`
			);
		}

		const currentTimestamp = timestamp || Date.now();

		let randomPart: string; // 10 bytes of randomness

		// Increment random part if last timestamp is the same as the current one (same ms).
		if (this.lastTimestamp === currentTimestamp) {
			const intRandomPart = BigInt(`0x${this.lastRandomPart}`) + 1n;

			randomPart = intRandomPart.toString(16).padStart(20, "0");

			// If bigint overflows in hex (all 'f's), remove first character.
			// Very unlikely to happen.
			if (intRandomPart > MAX_RANDOM_BIGINT) {
				randomPart = randomPart.slice(1);
			}

			this.lastRandomPart = randomPart;
		} else {
			randomPart = randomBytes(10).toString("hex");
			this.lastRandomPart = randomPart;
		}

		this.lastTimestamp = currentTimestamp;

		const timePart = currentTimestamp.toString(16).padStart(12, "0"); // 6 bytes timestamp (ms precision)

		const seuid = addHyphens(timePart + randomPart);
		return seuid;
	}

	/**
	 * Get timestamp from SEUID.
	 * @param seuid A valid SEUID
	 * @param skipValidation Skip input validation if you're sure you're passing a valid SEUID.
	 */
	static timestamp(seuid: string, skipValidation: boolean = false) {
		if (!skipValidation && !SEUID_REGEX.test(seuid)) {
			throw new Error("SEUID timestamp error: invalid input");
		}

		return parseInt(seuid.slice(0, 13).replace("-", ""), 16);
	}

	/**
	 * Get date from SEUID.
	 * @param seuid A valid SEUID
	 * @param skipValidation Skip input validation if you're sure you're passing a valid SEUID.
	 */
	static date(seuid: string, skipValidation: boolean = false) {
		if (!skipValidation && !SEUID_REGEX.test(seuid)) {
			throw new Error("SEUID date error: invalid input");
		}

		return new Date(this.timestamp(seuid, skipValidation));
	}

	/**
	 * Encode a SEUID to Base58.
	 * @param seuid A valid SEUID
	 */
	static toBase58(seuid: string) {
		if (!SEUID_REGEX.test(seuid)) {
			throw new Error("SEUID toBase58 error: invalid input");
		}

		return encodeB58(seuid);
	}

	/**
	 * Decode a SEUID from Base58 to hex.
	 * @param seuidBase58 A valid SEUID encoded in Base58
	 * @param throwOnInvalid Throw instead of returning null with invalid input/output.
	 */
	static toSEUID(seuidBase58: string, throwOnInvalid?: false): string | null;
	static toSEUID(seuidBase58: string, throwOnInvalid: true): string;

	static toSEUID(seuidBase58: string, throwOnInvalid?: boolean) {
		if (!SEUID_B58_REGEX.test(seuidBase58)) {
			if (throwOnInvalid) {
				throw new Error("SEUID toSEUID error: invalid input");
			}
			return null;
		}

		return decodeB58(seuidBase58, throwOnInvalid);
	}
}
