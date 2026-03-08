import { describe, it, expect } from 'vitest';
import { computeFileHash } from './file-hash';

describe('computeFileHash', () => {
  it('동일한 내용은 동일한 해시 반환', async () => {
    const data = new TextEncoder().encode('hello pdf').buffer;
    const h1 = await computeFileHash(data);
    const h2 = await computeFileHash(data);
    expect(h1).toBe(h2);
  });

  it('다른 내용은 다른 해시 반환', async () => {
    const a = new TextEncoder().encode('file a').buffer;
    const b = new TextEncoder().encode('file b').buffer;
    expect(await computeFileHash(a)).not.toBe(await computeFileHash(b));
  });

  it('64자 hex 문자열 반환', async () => {
    const data = new TextEncoder().encode('test').buffer;
    const hash = await computeFileHash(data);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('빈 버퍼도 처리', async () => {
    const hash = await computeFileHash(new ArrayBuffer(0));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
