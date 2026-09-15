/**
 * BaseN
 *
 * @version 1.0.11
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
  const { subtle } = crypto;

  if (subtle === undefined) {
    const base = alphabet.length;
    console.warn(
      `generateBase${base}Hash() method is available only in secure contexts. Fallback: generateBase${base}Random().`,
    );
    return generateBaseNRandom(alphabet, length);
  }

  if (!alphabet.length) {
    throw new Error('Invalid alphabet.');
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
  const chars: string[] = [];
  let n = BigInt(
    `0x${[...new Uint8Array(await subtle.digest('SHA-512', typeof data === 'string' ? new TextEncoder().encode(data) : data))].map((b) => b.toString(16).padStart(2, '0')).join('')}`,
  );
  const base = BigInt(alphabet.length);

  while (chars.length < length) {
    chars.unshift(alphabet[Number(n % base)] ?? '');
    n /= base;
  }

  return chars.join('');
}

function generateBaseNRandom(alphabet: string, length: number): string {
  length = clamp(length);
  const base = alphabet.length;
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce((a, b) => a + alphabet[b % base], '');
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
