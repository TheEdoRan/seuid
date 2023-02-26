export const addHyphens = (id: string) => {
	return (
		id.substring(0, 8) +
		"-" +
		id.substring(8, 12) +
		"-" +
		id.substring(12, 16) +
		"-" +
		id.substring(16, 20) +
		"-" +
		id.substring(20)
	);
};

export const calculateEncodedIdLength = (characterSet: string) => {
	const bigIntCharacterSetLength = BigInt(characterSet.length);

	// "ffffffff-ffff-ffff-ffff-ffffffffffff" in bigint format
	let maxBigIntSeuid = 340282366920938463463374607431768211455n;
	let len = 0;

	while (maxBigIntSeuid > 0) {
		maxBigIntSeuid /= bigIntCharacterSetLength;
		len++;
	}

	return len;
};
