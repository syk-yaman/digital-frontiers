/**
 * Validates if a string is a valid hex color code
 * @param value - The string to validate
 * @returns boolean - True if the value is a valid hex color
 */
export function isHexColor(value: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}
