import { randomBytes } from "crypto";
import { decodeSEUID, encodeSEUID } from "./encoder";
import { SEUID_REGEX } from "./regexes";
import { addHyphens, calculateEncodedIdLength } from "./utils";

export type SEUIDOpts = {
	encoderCharacterSet?: string;
};

export class SEUID {
	public static readonly MAX_TIMESTAMP = 281474976710655;
	public readonly ENCODED_ID_LENGTH: number;
	private encoderCharacterSet: string;
	private readonly MAX_RANDOM_BIGINT = 1208925819614629174706175n;

	private lastTimestamp: number;
	private lastIntRandomPart = 0n;

	constructor(opts?: SEUIDOpts) {
		if (opts?.encoderCharacterSet) {
			if (opts.encoderCharacterSet.length < 16 || opts.encoderCharacterSet.length > 64) {
				throw new Error(`SEUID error: invalid character set length: min 16, max 64`);
			}

			// Check for duplicate characters.
			const charsetArr = opts.encoderCharacterSet.split("");

			if (charsetArr.length !== new Set(charsetArr).size) {
				throw new Error(`SEUID error: duplicate values in charset`);
			}
		}

		// Defaults to Base58 character set.
		this.encoderCharacterSet =
			opts?.encoderCharacterSet ?? "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
		this.ENCODED_ID_LENGTH = opts?.encoderCharacterSet
			? calculateEncodedIdLength(opts.encoderCharacterSet)
			: 22;
	}

	/**
	 * Generate a new SEUID.
	 * @param timestamp A seed for the time part of the SEUID. Max: `281474976710655`
	 */
	generate(timestamp?: number) {
		if (timestamp && timestamp > SEUID.MAX_TIMESTAMP) {
			throw new Error(
				`SEUID generate error: input timestamp exceeds the maximum of ${SEUID.MAX_TIMESTAMP}`
			);
		}

		const currentTimestamp = timestamp ?? Date.now();

		// Increment random part. If bigint overflows in hex (all 'f's), restart counter.
		// Very unlikely to happen.
		const incrementedIntRandomPart =
			this.lastIntRandomPart >= this.MAX_RANDOM_BIGINT ? 0n : this.lastIntRandomPart + 1n;

		// If last timestamp is the same as current one, use the last incremented bigint
		// generated previously. Otherwise generate new random sequence.
		this.lastIntRandomPart =
			this.lastTimestamp === currentTimestamp
				? incrementedIntRandomPart
				: BigInt(`0x${randomBytes(10).toString("hex")}`);

		this.lastTimestamp = currentTimestamp;

		const timePart = currentTimestamp.toString(16).padStart(12, "0"); // 6 bytes timestamp (ms precision)
		const randomPart = this.lastIntRandomPart.toString(16).padStart(20, "0"); // 10 bytes of randomness

		return addHyphens(`${timePart}${randomPart}`);
	}

	/**
	 * Get timestamp from SEUID.
	 * @param seuid A valid SEUID
	 * @param skipValidation Skip input validation if you're sure you're passing a valid SEUID.
	 */
	timestamp(seuid: string, skipValidation: boolean = false) {
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
	date(seuid: string, skipValidation: boolean = false) {
		if (!skipValidation && !SEUID_REGEX.test(seuid)) {
			throw new Error("SEUID date error: invalid input");
		}

		return new Date(this.timestamp(seuid, skipValidation));
	}

	/**
	 * Encode a SEUID with a given character set.
	 * @param seuid A valid SEUID
	 * @param skipValidation Skip input validation if you're sure you're passing a valid SEUID.
	 */
	encode(seuid: string, skipValidation: boolean = false) {
		if (!skipValidation && !SEUID_REGEX.test(seuid)) {
			throw new Error("SEUID encode error: invalid input");
		}

		return encodeSEUID(seuid, this.encoderCharacterSet, this.ENCODED_ID_LENGTH);
	}

	/**
	 * Decode a SEUID from character set to hex.
	 * @param encodedSeuid A valid SEUID encoded in the given character set
	 * @param throwOnInvalid Throw instead of returning null with invalid input/output.
	 */
	decode(encodedSeuid: string, throwOnInvalid?: false): string | null;
	decode(encodedSeuid: string, throwOnInvalid: true): string;

	decode(encodedSeuid: string, throwOnInvalid?: boolean) {
		try {
			return decodeSEUID(
				encodedSeuid,
				this.encoderCharacterSet,
				this.ENCODED_ID_LENGTH,
				throwOnInvalid
			);
		} catch (e) {
			if (throwOnInvalid) {
				throw new Error(`SEUID decode error: ${e.message}`);
			}

			return null;
		}
	}
}
