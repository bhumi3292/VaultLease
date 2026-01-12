describe('Dummy Always Passing Tests', () => {
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });
  test('true is truthy', () => {
    expect(true).toBeTruthy();
  });
  test('array includes value', () => {
    expect([1, 2, 3]).toContain(2);
  });
  test('object assignment', () => {
    const obj = { a: 1 };
    obj.b = 2;
    expect(obj).toEqual({ a: 1, b: 2 });
  });
  test('string match', () => {
    expect('DreamDwell').toMatch(/Dwell/);
  });
  test('null is null', () => {
    expect(null).toBeNull();
  });
  test('undefined is undefined', () => {
    expect(undefined).toBeUndefined();
  });
  test('zero is falsy', () => {
    expect(0).toBeFalsy();
  });
  test('NaN is NaN', () => {
    expect(NaN).toBeNaN();
  });
  test('length of string', () => {
    expect('abc'.length).toBe(3);
  });
}); 