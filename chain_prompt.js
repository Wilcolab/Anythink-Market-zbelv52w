// Chain Prompt
/**
 * Converts a string to kebab-case format
 * @param {string} str - The input string to convert
 * @returns {string} The kebab-case formatted string
 * @throws {TypeError} If input is not a string
 */
function toKebabCase(str) {
    // Validate input is a string
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }

    // Return empty string if input is empty or whitespace only
    if (!str || !str.trim()) {
        return '';
    }

    // Replace camelCase boundaries with hyphens
    let result = str.replace(/([a-z])([A-Z])/g, '$1-$2');

    // Replace underscores and spaces with hyphens, handle multiple separators
    result = result.replace(/[_\s]+/g, '-');

    // Remove special characters except hyphens and alphanumerics
    result = result.replace(/[^\w-]/g, '');

    // Convert to lowercase
    result = result.toLowerCase();

    // Remove leading/trailing hyphens and collapse consecutive hyphens
    result = result.replace(/^-+|-+$/g, '').replace(/-+/g, '-');

    // Return empty string if nothing remains after cleanup
    return result || '';
}