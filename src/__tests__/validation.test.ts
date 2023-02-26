import { SEUID } from "..";
import { SEUID_REGEX } from "../regexes";

const seuid = new SEUID();

describe("constructor options validation ", () => {
	test("instance with shorter than 16 character set throws on creation", () => {
		expect(() => {
			new SEUID({ encoderCharacterSet: "ABC" });
		}).toThrow();
	});

	test("instance with longer than 64 character set throws on creation", () => {
		expect(() => {
			new SEUID({
				encoderCharacterSet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_?/\\",
			});
		}).toThrow();
	});

	test("instance with duplicate characters in charset throws on creation", () => {
		expect(() => {
			new SEUID({ encoderCharacterSet: "ABCDDEEEEEFFFFGGGGaaaa0000bbbb||???," });
		}).toThrow();
	});

	test("instance with charset of length 36 and no duplicates works", () => {
		expect(() => {
			new SEUID({ encoderCharacterSet: "0123456789abcdefghijklmnopqrstuvwxyz" });
		}).not.toThrow();
	});
});

describe("input and output validation", () => {
	const id = "0186745f-ab2f-d8ad-6ccf-b851f77e2173";
	const base58Id = "1BvaMwjnCjWp6PBqDb463t";
	const timestamp = 1676989672239;
	const date = new Date("2023-02-21T14:27:52.239Z");

	// generate
	test("generate() with valid timestamp input passes", () => {
		expect(seuid.generate(timestamp)).toMatch(SEUID_REGEX);
	});

	test("generate() with invalid timestamp input throws", () => {
		expect(() => {
			seuid.generate(SEUID.MAX_TIMESTAMP + 1);
		}).toThrow();
	});

	// timestamp
	test("timestamp() with valid SEUID input passes", () => {
		expect(seuid.timestamp(id)).toBe(timestamp);
	});

	test("timestamp() with invalid SEUID input and no second argument throws", () => {
		expect(() => {
			seuid.timestamp("invalid string");
		}).toThrow();
	});

	test("timestamp() with invalid SEUID input and skipValidation set to false throws", () => {
		expect(() => {
			seuid.timestamp("invalid string", false);
		}).toThrow();
	});

	test("timestamp() with invalid SEUID input and skipValidation set to true returns NaN", () => {
		expect(seuid.timestamp("invalid string", true)).toBeNaN();
	});

	test("timestamp() with valid SEUID input and skipValidation set to true works", () => {
		expect(seuid.timestamp(id, true)).toBe(timestamp);
	});

	// date
	test("date() with valid SEUID input passes", () => {
		expect(seuid.date(id)).toStrictEqual(date);
	});

	test("date() with invalid SEUID input and no second argument throws", () => {
		expect(() => {
			seuid.date("invalid string");
		}).toThrow();
	});

	test("date() with invalid SEUID input and skipValidation set to false throws", () => {
		expect(() => {
			seuid.date("invalid string", false);
		}).toThrow();
	});

	test("date() with invalid SEUID input and skipValidation set to true returns Invalid Date", () => {
		expect(Number.isNaN(seuid.date("invalid string", true).getTime())).toBe(true);
	});

	test("date() with valid SEUID input and skipValidation set to true works", () => {
		expect(seuid.date(id, true)).toStrictEqual(date);
	});

	/*
	 * ENCODING/DECODING (defaults to Base58)
	 */

	// encode
	test("encode() with valid SEUID input passes", () => {
		expect(seuid.encode(id)).toBe(base58Id);
	});

	// "invalid string" cannot be conveted to hex
	test('encode() with "invalid string" as input and no second argument throws', () => {
		expect(() => {
			seuid.encode("invalid string");
		}).toThrow();
	});

	// "invalid string" cannot be conveted to hex
	test('encode() with "invalid string" as input and skipValidation set to false throws', () => {
		expect(() => {
			seuid.encode("invalid string", false);
		}).toThrow();
	});

	test("encode() with valid SEUID input and skipValidation set to true works", () => {
		expect(seuid.encode(id, true)).toBe(base58Id);
	});

	// "ffa9e10b3c" is valid hex input, but invalid SEUID
	test("encode() with invalid SEUID but valid hex input and skipValidation set to true doesn't throw", () => {
		expect(() => {
			seuid.encode("ffa9e10b3c", true);
		}).not.toThrow();
	});

	// decode
	test("decode() with valid SEUID input passes", () => {
		expect(seuid.decode(base58Id)).toBe(id);
	});

	test("decode() with invalid SEUID input returns null", () => {
		expect(seuid.decode("invalid string")).toBeNull();
	});

	test("decode() with invalid SEUID input and throwOnInvalid set to false returns null", () => {
		expect(seuid.decode("invalid string", false)).toBeNull();
	});

	test("decode() with invalid SEUID input and throwOnInvalid set to true throws", () => {
		expect(() => {
			seuid.decode("invalid string", true);
		}).toThrow();
	});
});
