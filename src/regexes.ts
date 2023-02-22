import { BASE58_ALPHABET } from "./base58";

export const SEUID_REGEX = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;

export const SEUID_B58_REGEX = new RegExp(`^[${BASE58_ALPHABET}]{22}$`);
