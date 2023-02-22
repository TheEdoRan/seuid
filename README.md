# [SEquential Unique IDentifier](https://github.com/TheEdoRan/seuid)

> A Sequential Unique Identifier (lexicographically sortable) generator library.

## Description

This library is highly inspired by the [ULID spec](https://github.com/ulid/spec), but instead of creating [Crockford's Base32 strings](http://www.crockford.com/base32.html), it generates sequential IDs in a "UUID" hex format. This is super useful for databases like Postgres, that have a `uuid` type to store UUIDs efficiently.

If you instead want to convert ULIDs to UUIDs and vice versa, check out this library: [ulid-uuid-converter](https://github.com/TheEdoRan/ulid-uuid-converter).

If multiple SEUIDs are generated within a millisecond by the same instance, the `generate` function will increment the last characters of the generated SEUID.

## Installation

```sh
npm i seuid
```

## Usage

```typescript
import { SEUID } from "seuid";

// Create a new instance
const seuid = new SEUID();

const id = seuid.generate();
// output: 018673f1-9c2f-8d2a-4d33-a63c7217444a

const timestamp = SEUID.timestamp(id);
// output: 1676982459439

const date = SEUID.date(id);
// output: 2023-02-21T12:27:39.439Z

/* The library also supports encoding/decoding to/from Base58.
 * This is useful for URLs and other similar contexts.
 * The encoded string is always 22 characters long.
 */

const encoded = SEUID.toBase58(id);
// output: 1BvaCn3xh3PmJdcPaZoK9b

const decoded = SEUID.toSEUID(encoded);
// output: 018673f1-9c2f-8d2a-4d33-a63c7217444a
```

## Optional arguments

### `generate()`

You can pass an optional timestamp argument to the `generate` function. When providing a timestamp, the time part of the generated SEUID will remain the same. If not provided, `generate` will use `Date.now()` as timetamp.

Max valid timestamp is `281474976710655`, in date: `Tue Aug 02 10889 05:31:50`.

`MAX_SEUID_TIMESTAMP` is also exported by this library.

### Example

```typescript
for (let i = 0; i < 5; i++) {
	// specific timestamp
	const id = seuid.generate(1676985397606);
	console.log(id);
}
```

Will output:

```
0186741e-7166-1872-a926-b3954cbbbf5e
0186741e-7166-1872-a926-b3954cbbbf5f
0186741e-7166-1872-a926-b3954cbbbf60
0186741e-7166-1872-a926-b3954cbbbf61
0186741e-7166-1872-a926-b3954cbbbf62
```

As you can see, the time part is the same. Last characters are incremented.

---

### `timestamp()` and `date()`

You can pass an optional second argument called `skipValidation` to `timestamp` and `date` functions. This option skips input validation. Only use it if you're really sure that you're passing a valid SEUID as input.

### Example

```typescript
// these two will throw!
const time = SEUID.timestamp("invalid string");
const date = SEUID.date("invalid string");

// these two will skip input validation and return unpredictable values with invalid strings
const time = SEUID.timestamp("invalid string", true);
// output: NaN

const date = SEUID.date("another invalid string", true);
// output: 1970-01-01T00:00:00.010Z
```

---

### `toSEUID()`

The `toSEUID` function, unlike the other ones, returns null by default if input or output is invalid. This is because the Base58 encoded string is intended to face the public, so an user error would be common in this case. If you want the `throw` behavior, you can pass an optional second argument called `throwOnInvalid` to the function.

### Example

```typescript
// This one will output null
const decoded = SEUID.toSEUID("invalid string");

// This one will throw!
const decoded = SEUID.toSEUID("invalid string", true);
```

## Generation

Generation works like this:

```
018673f1-9c2f-8d2a-4d33-a63c7217444a
|-----------| |--------------------|
  timestamp        random part
   6 bytes          10 bytes
```

### Monotonic sort order

Here's the behavior when generating multiple SEUIDs within the same millisecond:

```
01867402-6678-471d-d1bc-bd1e62ac31ca
01867402-6678-471d-d1bc-bd1e62ac31cb
01867402-6678-471d-d1bc-bd1e62ac31cc
01867402-6678-471d-d1bc-bd1e62ac31cd
01867402-6678-471d-d1bc-bd1e62ac31ce
01867402-6678-471d-d1bc-bd1e62ac31cf
01867402-6678-471d-d1bc-bd1e62ac31d0
01867402-6679-2b76-2942-d2efe6f6d255 <-- millisecond changed
01867402-6679-2b76-2942-d2efe6f6d256
01867402-6679-2b76-2942-d2efe6f6d257
```

The generator incremented the last characters of the string.

## Credits

The [ULID spec](https://github.com/ulid/spec).

Big thanks to [cbschuld](https://github.com/cbschuld) for the [Base58](https://github.com/cbschuld/uuid-base58) encoding and decoding functions.

## License

This project is licensed under the [MIT License](https://github.com/TheEdoRan/seuid/blob/main/LICENSE).
