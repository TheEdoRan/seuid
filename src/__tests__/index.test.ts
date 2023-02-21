import { MAX_SEUID_TIMESTAMP, SEUID } from "..";
import { SEUID_REGEX } from "../regexes";

const seuid = new SEUID();

describe("input validation", () => {
	const id = "0186745f-ab2f-d8ad-6ccf-b851f77e2173";
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
});

// GENERATION

const generate = (cycles: number, timestamp?: number) => {
	const results: { seuid: string; timestamp: number; date: Date }[] = [];

	for (let i = 0; i < cycles; i++) {
		const id = seuid.generate(timestamp);
		const time = SEUID.timestamp(id);
		const date = SEUID.date(id);

		results.push({ seuid: id, timestamp: time, date });
	}

	return results;
};

describe("generate 100 SEUIDs", () => {
	test.each(generate(100))("generated SEUID: $seuid", ({ seuid: id }) => {
		expect(id).toMatch(SEUID_REGEX);
	});
});

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
