import { describe, it, expect } from 'vitest';
import { parsePageRanges } from './utils';

describe('parsePageRanges', () => {
  it('단일 페이지 파싱', () => {
    expect(parsePageRanges('3', 10)).toEqual([2]);
  });

  it('범위 파싱', () => {
    expect(parsePageRanges('1-3', 10)).toEqual([0, 1, 2]);
  });

  it('복합 범위 파싱', () => {
    expect(parsePageRanges('1-3, 5, 7-9', 10)).toEqual([0, 1, 2, 4, 6, 7, 8]);
  });

  it('중복 페이지 제거', () => {
    expect(parsePageRanges('1, 1, 2', 5)).toEqual([0, 1]);
  });

  it('결과가 항상 오름차순', () => {
    const result = parsePageRanges('5, 1-3', 10)!;
    expect(result).toEqual([...result].sort((a, b) => a - b));
  });

  it('빈 입력은 null', () => {
    expect(parsePageRanges('', 10)).toBeNull();
  });

  it('범위 초과는 null', () => {
    expect(parsePageRanges('1-11', 10)).toBeNull();
  });

  it('0 이하 페이지는 null', () => {
    expect(parsePageRanges('0', 10)).toBeNull();
  });

  it('역순 범위는 null', () => {
    expect(parsePageRanges('5-3', 10)).toBeNull();
  });

  it('숫자가 아닌 값은 null', () => {
    expect(parsePageRanges('a-b', 10)).toBeNull();
  });

  it('전체 페이지 선택', () => {
    expect(parsePageRanges('1-10', 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
