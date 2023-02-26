# [SEquential Unique IDentifier](https://github.com/TheEdoRan/seuid)

> A Sequential Unique Identifier (lexicographically sortable) generator library.

## Description

This library is highly inspired by the [ULID spec](https://github.com/ulid/spec), but instead of creating [Crockford's Base32 strings](http://www.crockford.com/base32.html), it generates sequential IDs in a "UUID" hex format. This is super useful for databases like Postgres, that have a `uuid` type to store UUIDs efficiently.

If you instead want to convert ULIDs to UUIDs and vice versa, check out this library: [ulid-uuid-converter](https://github.com/TheEdoRan/ulid-uuid-converter).

If multiple SEUIDs are generated within a millisecond by the same instance, the `generate()` method will increment the last characters of the generated SEUID.

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
// outputs: 018673f1-9c2f-8d2a-4d33-a63c7217444a

const timestamp = seuid.timestamp(id);
// outputs: 1676982459439

const date = seuid.date(id);
// outputs: 2023-02-21T12:27:39.439Z

/* The library also supports encoding/decoding to custom character sets.
 * If character set is not specified during creation of the SEUID instance,
 * it will default to Base58 encoding.
 * This is useful for URLs and other similar contexts.
 */

// Create a new instance
const seuid = new SEUID(); // defaults to Base58

const encoded = seuid.encode(id);
// outputs: 1BvaCn3xh3PmJdcPaZoK9b

const decoded = seuid.decode(encoded);
// outputs: 018673f1-9c2f-8d2a-4d33-a63c7217444a
```

## Encoding and decoding

The library supports encoding and decoding SEUIDs with a custom character set.
You can use the default Base58 charset, or pass a custom one when creating a new `SEUID` instance, via the `encoderCharacterSet` option.

Minimum length for the custom charset is `16` characters, maximum is `64`, and duplicate characters are not allowed. Providing an invalid character set will throw an error on creation.

Every encoded ID will have a fixed size, which is determined by the character set length provided on instance creation. You can access the encoded IDs size via `ENCODED_ID_LENGTH` property.

### Example

```typescript
// Example with custom Base64URL charset
const seuid = new SEUID({
	encoderCharacterSet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
});

const id = seuid.generate();
// outputs: 01868aed-2e75-77ef-e3bf-ddafe1baf034

const encodedLength = seuid.ENCODED_ID_LENGTH;
// outputs: 22

const encoded = seuid.encode(id);
// outputs: ABhortLnV37-O_3a_huvA0

const decoded = seuid.decode(encoded);
// outputs: 01868aed-2e75-77ef-e3bf-ddafe1baf034
```

## Optional arguments

### `generate()`

You can pass an optional timestamp argument to the `generate()` method. When providing a timestamp, the time part of the generated SEUID will remain the same. If not provided, `generate()` will use `Date.now()` as timestamp.

Max valid timestamp is `281474976710655`, in date: `Tue Aug 02 10889 05:31:50`.

You can access the maximum timestamp via `SEUID.MAX_TIMESTAMP`.

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

### `timestamp()`, `date()`, `encode()`

You can pass an optional second argument called `skipValidation` to `timestamp()`, `date()` and `encode()` methods. This option skips input validation, resulting in faster execution. Only use it if you're really sure that you're passing a valid SEUID as input.

### Example

```typescript
// these two will throw!
const time = seuid.timestamp("invalid string");
const date = seuid.date("invalid string");

// these two will skip input validation and return unpredictable values with invalid strings
const time = seuid.timestamp("invalid string", true);
// outputs: NaN

const date = seuid.date("another invalid string", true);
// outputs: 1970-01-01T00:00:00.010Z

const encoded = seuid.encode("invalid string", true);
// throws SyntaxError
```

---

### `decode()`

The `decode()` method, unlike the other ones, returns null by default if input or output is invalid. This is because the encoded string is intended to face the public, so an user error would be common in multiple scenarios. If you want the `throw` behavior, you can pass an optional second argument called `throwOnInvalid` to the method.

### Example

```typescript
// This one will return null
const decoded = seuid.decode("invalid string");

// This one will throw!
const decoded = seuid.decode("invalid string", true);
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

Big thanks to [cbschuld's uuid-base58](https://github.com/cbschuld/uuid-base58) library for the base implementation of encoding and decoding.

## License

This project is licensed under the [MIT License](https://github.com/TheEdoRan/seuid/blob/main/LICENSE).
