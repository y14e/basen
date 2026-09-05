/**
 * BaseN
 *
 * @version 1.0.10
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/basen}
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Data = string | ArrayBuffer;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const BASE36_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_LENGTH = 8;

// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------

export async function generateBase36Hash(
  data: Data = '',
  length = DEFAULT_LENGTH,
): Promise<string> {
  return generateBaseNHash(BASE36_ALPHABET, data, length);
}

export function generateBase36Random(length = DEFAULT_LENGTH): string {
  return generateBaseNRandom(BASE36_ALPHABET, length);
}

export async function generateBase62Hash(
  data: Data = '',
  length = DEFAULT_LENGTH,
): Promise<string> {
  return generateBaseNHash(BASE62_ALPHABET, data, length);
}

export function generateBase62Random(length = DEFAULT_LENGTH): string {
  return generateBaseNRandom(BASE62_ALPHABET, length);
}

// -----------------------------------------------------------------------------
// Core
// -----------------------------------------------------------------------------

async function generateBaseNHash(
  alphabet: string,
  data: Data,
  length: number,
): Promise<string> {
  if (crypto.subtle === undefined) {
    const base = alphabet.length;
    console.warn(
      `generateBase${base}Hash() method is available only in secure contexts. Fallback: generateBase${base}Random().`,
    );
    return generateBaseNRandom(alphabet, length);
  }

  if (
    typeof data !== 'string' &&
    !(data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data)
  ) {
    console.warn('Invalid data. Fallback: empty string.');
    data = '';
  }

  length = clamp(length);
  let result = '';
  let n = BigInt(`0x${await hex(data)}`);
  const base = BigInt(alphabet.length);

  while (result.length < length) {
    result = alphabet[Number(n % base)] + result;
    n /= base;
  }

  return result;
}

function generateBaseNRandom(alphabet: string, length: number): string {
  length = clamp(length);
  let result = '';
  const randoms = crypto.getRandomValues(new Uint8Array(length));
  const base = alphabet.length;

  for (let i = 0; i < length; i++) {
    result += alphabet[(randoms[i] ?? 0) % base];
  }

  return result;
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

function clamp(length: number): number {
  function fallback(length: number): number {
    console.warn(`Invalid length. Fallback: ${length}.`);
    return length;
  }

  if (typeof length !== 'number' || Number.isNaN(length)) {
    return fallback(DEFAULT_LENGTH);
  }

  if (length < 1) {
    return fallback(1);
  }

  if (length > 64) {
    return fallback(64);
  }

  return length;
}

async function hex(data: Data): Promise<string> {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        typeof data === 'string' ? new TextEncoder().encode(data) : data,
      ),
    ),
  ]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
