import type { SEUIDOpts } from "..";
import { SEUID } from "..";

const generate = (cycles: number, timestamp?: number, opts?: SEUIDOpts) => {
	const results: {
		seuid: string;
		timestamp: number;
		date: Date;
		encodedSeuid: string;
		decodedSeuid: string | null;
	}[] = [];
	const seuid = new SEUID(opts);

	for (let i = 0; i < cycles; i++) {
		const id = seuid.generate(timestamp);
		const time = seuid.timestamp(id);
		const date = seuid.date(id);
		const encodedSeuid = seuid.encode(id);
		const decodedSeuid = seuid.decode(encodedSeuid);

		results.push({ seuid: id, timestamp: time, date, encodedSeuid, decodedSeuid });
	}

	return results;
};

describe("generate() with a seed always returns the same time part", () => {
	const seed = 1676990893495;
	const date = new Date("2023-02-21T14:48:13.495Z");

	test.each(generate(10, seed))("$seuid -> $timestamp", ({ timestamp: resultTime }) => {
		expect(resultTime).toBe(seed);
	});

	test.each(generate(10, seed))("$seuid -> $date", ({ date: resultDate }) => {
		expect(resultDate).toStrictEqual(date);
	});
});

describe("generate 100 SEUIDs, encode and decode them with different character sets", () => {
	// default Base58 encoding
	test.each(generate(100))(
		"Base58: $seuid -> $encodedSeuid -> $decodedSeuid",
		({ seuid: id, decodedSeuid }) => {
			expect(decodedSeuid).toBe(id);
		}
	);

	// Hex encoding
	test.each(
		generate(100, undefined, {
			encoderCharacterSet: "0123456789abcdef",
		})
	)("Hex: $seuid -> $encodedSeuid -> $decodedSeuid", ({ seuid: id, decodedSeuid }) => {
		expect(decodedSeuid).toBe(id);
	});

	// Base64URL encoding
	test.each(
		generate(100, undefined, {
			encoderCharacterSet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
		})
	)("Base64URL: $seuid -> $encodedSeuid -> $decodedSeuid", ({ seuid: id, decodedSeuid }) => {
		expect(decodedSeuid).toBe(id);
	});

	// Crockfrod's Base32 encoding
	test.each(
		generate(100, undefined, {
			encoderCharacterSet: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
		})
	)("Crockford Base32: $seuid -> $encodedSeuid -> $decodedSeuid", ({ seuid: id, decodedSeuid }) => {
		expect(decodedSeuid).toBe(id);
	});
});
