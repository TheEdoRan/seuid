import { MAX_SEUID_TIMESTAMP, SEUID } from "..";
import { SEUID_B58_REGEX, SEUID_REGEX } from "../regexes";

const seuid = new SEUID();

describe("input validation", () => {
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
			seuid.generate(MAX_SEUID_TIMESTAMP + 1);
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

	// toBase58
	test("toBase58() with valid SEUID input passes", () => {
		expect(SEUID.toBase58(id)).toBe(base58Id);
	});

	test("toBase58() with invalid SEUID input throws", () => {
		expect(() => {
			SEUID.toBase58("invalid string");
		}).toThrow();
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

// GENERATION

const generate = (cycles: number, timestamp?: number) => {
	const results: {
		seuid: string;
		timestamp: number;
		date: Date;
		encodedSeuid: string;
		decodedSeuid: string | null;
	}[] = [];

	for (let i = 0; i < cycles; i++) {
		const id = seuid.generate(timestamp);
		const time = SEUID.timestamp(id);
		const date = SEUID.date(id);
		const encodedSeuid = SEUID.toBase58(id);
		const decodedSeuid = SEUID.fromBase58(encodedSeuid);

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

describe("generate 100 SEUIDs that match SEUID_REGEX", () => {
	test.each(generate(100))(`$seuid matches ${SEUID_REGEX}`, ({ seuid: id }) => {
		expect(id).toMatch(SEUID_REGEX);
	});
});

describe("encode and decode 100 SEUIDs that match relative regexes", () => {
	test.each(generate(100))(`$encodedSeuid matches ${SEUID_B58_REGEX}`, ({ encodedSeuid }) => {
		expect(encodedSeuid).toMatch(SEUID_B58_REGEX);
	});

	test.each(generate(100))(`$decodedSeuid matches ${SEUID_REGEX}`, ({ decodedSeuid }) => {
		expect(decodedSeuid).toMatch(SEUID_REGEX);
	});
});

describe("generate 100 SEUIDs, convert them to Base58 and then back to hex", () => {
	test.each(generate(100))(
		"$seuid -> $encodedSeuid -> $decodedSeuid",
		({ seuid: id, decodedSeuid }) => {
			expect(decodedSeuid).toBe(id);
		}
	);
});
