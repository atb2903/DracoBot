import { capitalize } from '../../src/utils/capitalize';

test('capitalize should capitalize only the first letter of a string', () => {
   expect(capitalize('hello world')).toBe('Hello world');
});

test('capitalize should retain capitalization of the rest of the string', () => {
    expect(capitalize('hello World')).toBe('Hello World');
});

test('capitalize should not change a string that is already capitalized', () => {
    expect(capitalize('Hello world')).toBe('Hello world');
});

test('capitalize should return an empty string if given an empty string', () => {
    expect(capitalize('')).toBe('');
});

test('capitalize should handle single character lower case strings', () => {
    expect(capitalize('a')).toBe('A');
});

test('capitalize should handle single character upper case strings', () => {
    expect(capitalize('A')).toBe('A');
});

test('capitalize should handle strings with leading whitespace', () => {
    expect(capitalize('  hello world')).toBe('  hello world');
});

test('capitalize should handle strings with trailing whitespace', () => {
    expect(capitalize('hello world  ')).toBe('Hello world  ');
});

test('capitalize should handle strings with only whitespace', () => {
    expect(capitalize('   ')).toBe('   ');
});

test('capitalize should handle non-alphabetic characters at the start of the string', () => {
    expect(capitalize('1hello world')).toBe('1hello world');
});

test('capitalize should handle non-alphabetic characters in the elsewhere in the string', () => {
    expect(capitalize('hello1world')).toBe('Hello1world');
});