import { SEUID } from "..";
import { SEUID_B58_REGEX, SEUID_REGEX } from "../regexes";

const seuid = new SEUID();

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

describe("generate 1000 SEUIDs, convert them to Base58 and then back to hex", () => {
	test.each(generate(1000))(
		"$seuid -> $encodedSeuid -> $decodedSeuid",
		({ seuid: id, decodedSeuid }) => {
			expect(decodedSeuid).toBe(id);
		}
	);
});
