/**
 * BaseN
 *
 * @version 1.0.2
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/basen-ts}
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Data = string | ArrayBuffer;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const BASE36_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------

export async function generateBase36Hash(
  data: Data = '',
  length = 8,
): Promise<string> {
  return generateBaseNHash(BASE36_CHARS, data, length);
}

export function generateBase36Random(length = 8): string {
  return generateBaseNRandom(BASE36_CHARS, length);
}

export async function generateBase62Hash(
  data: Data = '',
  length = 8,
): Promise<string> {
  return generateBaseNHash(BASE62_CHARS, data, length);
}

export function generateBase62Random(length = 8): string {
  return generateBaseNRandom(BASE62_CHARS, length);
}

// -----------------------------------------------------------------------------
// Core
// -----------------------------------------------------------------------------

async function generateBaseNHash(
  chars: string,
  data: Data,
  length: number,
): Promise<string> {
  if (crypto?.subtle === undefined) {
    console.warn(
      `Available only in secure contexts. Fallback: generateBase${chars.length}Random.`,
    );
    return generateBaseNRandom(chars, length);
  }

  if (
    !(
      typeof data === 'string' ||
      data instanceof ArrayBuffer ||
      ArrayBuffer.isView(data)
    )
  ) {
    console.warn('Invalid data. Fallback: empty string.');
    data = '';
  }

  length = normalizeLength(length);
  let result = '';
  let n = BigInt(`0x${await sha256(data)}`);
  const base = BigInt(chars.length);

  while (result.length < length) {
    result = chars[Number(n % base)] + result;
    n /= base;
  }

  return result;
}

function generateBaseNRandom(chars: string, length: number): string {
  length = normalizeLength(length);
  let result = '';
  const randoms = crypto.getRandomValues(new Uint8Array(length));
  const base = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars[(randoms[i] ?? 0) % base];
  }

  return result;
}

function normalizeLength(length: number): number {
  if (
    typeof length !== 'number' ||
    Number.isNaN(length) ||
    length < 1 ||
    length > 64
  ) {
    console.warn('Invalid length. Fallback: 8.');
    return 8;
  }

  return length;
}

async function sha256(data: Data): Promise<string> {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        typeof data === 'string' ? new TextEncoder().encode(data) : data,
      ),
    ),
  )
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
