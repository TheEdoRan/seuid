import { SEUID } from "..";
import { SEUID_REGEX } from "../regexes";

const seuid = new SEUID();

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
		expect(SEUID.timestamp(id)).toBe(timestamp);
	});

	test("timestamp() with invalid SEUID input and no second argument throws", () => {
		expect(() => {
			SEUID.timestamp("invalid string");
		}).toThrow();
	});

	test("timestamp() with invalid SEUID input and skipValidation set to false throws", () => {
		expect(() => {
			SEUID.timestamp("invalid string", false);
		}).toThrow();
	});

	test("timestamp() with invalid SEUID input and skipValidation set to true returns NaN", () => {
		expect(SEUID.timestamp("invalid string", true)).toBeNaN();
	});

	test("timestamp() with valid SEUID input and skipValidation set to true works", () => {
		expect(SEUID.timestamp(id, true)).toBe(timestamp);
	});

	// date
	test("date() with valid SEUID input passes", () => {
		expect(SEUID.date(id)).toStrictEqual(date);
	});

	test("date() with invalid SEUID input and no second argument throws", () => {
		expect(() => {
			SEUID.date("invalid string");
		}).toThrow();
	});

	test("date() with invalid SEUID input and skipValidation set to false throws", () => {
		expect(() => {
			SEUID.date("invalid string", false);
		}).toThrow();
	});

	test("date() with invalid SEUID input and skipValidation set to true returns Invalid Date", () => {
		expect(Number.isNaN(SEUID.date("invalid string", true).getTime())).toBe(true);
	});

	test("date() with valid SEUID input and skipValidation set to true works", () => {
		expect(SEUID.date(id, true)).toStrictEqual(date);
	});

	/*
	 * BASE58 ENCODING/DECODING
	 */

	// toBase58
	test("toBase58() with valid SEUID input passes", () => {
		expect(SEUID.toBase58(id)).toBe(base58Id);
	});

	// "invalid string" cannot be conveted to hex
	test('toBase58() with "invalid string" as input and no second argument throws', () => {
		expect(() => {
			SEUID.toBase58("invalid string");
		}).toThrow();
	});

	// "invalid string" cannot be conveted to hex
	test('toBase58() with "invalid string" as input and skipValidation set to false throws', () => {
		expect(() => {
			SEUID.toBase58("invalid string", false);
		}).toThrow();
	});

	test("toBase58() with valid SEUID input and skipValidation set to true works", () => {
		expect(SEUID.toBase58(id, true)).toBe(base58Id);
	});

	// "ffa9e10b3c" is valid hex input, but invalid SEUID
	test("toBase58() with invalid SEUID but valid hex input and skipValidation set to true doesn't throw", () => {
		expect(() => {
			SEUID.toBase58("ffa9e10b3c", true);
		}).not.toThrow();
	});

	// fromBase58
	test("fromBase58() with valid SEUID input passes", () => {
		expect(SEUID.fromBase58(base58Id)).toBe(id);
	});

	test("fromBase58() with invalid SEUID input returns null", () => {
		expect(SEUID.fromBase58("invalid string")).toBeNull();
	});

	test("fromBase58() with invalid SEUID input and throwOnInvalid set to false returns null", () => {
		expect(SEUID.fromBase58("invalid string", false)).toBeNull();
	});

	test("fromBase58() with invalid SEUID input and throwOnInvalid set to true throws", () => {
		expect(() => {
			SEUID.fromBase58("invalid string", true);
		}).toThrow();
	});
});
