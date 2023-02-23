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

const decoded = SEUID.fromBase58(encoded);
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

### `fromBase58()`

The `fromBase58` function, unlike the other ones, returns null by default if input or output is invalid. This is because the Base58 encoded string is intended to face the public, so an user error would be common in this case. If you want the `throw` behavior, you can pass an optional second argument called `throwOnInvalid` to the function.

### Example

```typescript
// This one will return null
const decoded = SEUID.fromBase58("invalid string");

// This one will throw!
const decoded = SEUID.fromBase58("invalid string", true);
```

## Generation

Generation works like this:

```
018673f1-9c2f-8d2a-4d33-a63c7217444a
|-----------| |--------------------|
  timestamp        random  part
   6 bytes           10 bytes
```

Timestamp is in milliseconds. Randomness comes from `crypto.randomBytes()` function.

### Monotonic sort order

Here's the behavior when generating multiple SEUIDs within the same millisecond:

<pre>
<code>01867402-6678-471d-d1bc-bd1e62ac31<b>ca</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>cb</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>cc</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>cd</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>ce</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>cf</b>
01867402-6678-471d-d1bc-bd1e62ac31<b>d0</b>
01867402-667<b>9</b>-2b76-2942-d2efe6f6d2<b>55</b> <-- millisecond changed
01867402-6679-2b76-2942-d2efe6f6d2<b>56</b>
01867402-6679-2b76-2942-d2efe6f6d2<b>57</b>
            |                     ||
            ms                incremented</code>
</pre>

The generator incremented the last characters of the string for SEUIDs generated in the same millisecond.

When timestamp changes, a new random part is generated, as the ID is already sequential (and sortable) thanks to the updated time part.

## Credits

The [ULID spec](https://github.com/ulid/spec).

Big thanks to [cbschuld](https://github.com/cbschuld) for the [Base58](https://github.com/cbschuld/uuid-base58) encoding and decoding functions.

## License

This project is licensed under the [MIT License](https://github.com/TheEdoRan/seuid/blob/main/LICENSE).
