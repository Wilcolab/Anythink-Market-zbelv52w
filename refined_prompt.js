/**
 * Converts a string to camelCase format.
 * 
 * This function takes a string with various delimiters (spaces, underscores, hyphens)
 * and converts it to camelCase where the first word is lowercase and subsequent words
 * have their first letter capitalized.
 * 
 * @param {string} input - The input string to convert. Can contain spaces, underscores, or hyphens as delimiters.
 * @returns {string} The converted camelCase string. Returns an empty string if input is empty.
 * @throws {Error} Throws an error if the input is not a string.
 * 
 * @example
 * toCamelCase('hello world');           // 'helloWorld'
 * toCamelCase('hello_world');           // 'helloWorld'
 * toCamelCase('hello-world');           // 'helloWorld'
 * toCamelCase('hello world foo');       // 'helloWorldFoo'
 * toCamelCase('');                      // ''
 */

/**
 * Converts a string to dot.case format.
 * 
 * This function takes a string with various delimiters (spaces, underscores, hyphens)
 * and converts it to dot.case where all words are lowercase and joined by dots.
 * 
 * @param {string} input - The input string to convert. Can contain spaces, underscores, or hyphens as delimiters.
 * @returns {string} The converted dot.case string. Returns an empty string if input is empty.
 * @throws {Error} Throws an error if the input is not a string.
 * 
 * @example
 * toDotCase('hello world');             // 'hello.world'
 * toDotCase('hello_world');             // 'hello.world'
 * toDotCase('hello-world');             // 'hello.world'
 * toDotCase('hello world foo');         // 'hello.world.foo'
 * toDotCase('');                        // ''
 */

function toCamelCase(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    if (input === '') {
        return '';
    }

    // Split by spaces, underscores, hyphens and filter out empty strings
    const words = input.split(/[\s_-]+/).filter(word => word.length > 0);

    // Convert each word: first word lowercase, rest capitalize first letter
    return words
        .map((word, index) => {
            const lowerWord = word.toLowerCase();
            return index === 0
                ? lowerWord
                : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');
}

function toDotCase(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    if (input === '') {
        return '';
    }

    // Split by spaces, underscores, hyphens and filter out empty strings
    const words = input.split(/[\s_-]+/).filter(word => word.length > 0);

    // Convert each word to lowercase and join with dots
    return words.map(word => word.toLowerCase()).join('.');
}
