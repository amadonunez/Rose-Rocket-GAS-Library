/**
 * Checks if a given string is a valid filename.
 *  This is a basic check and might need to be adjusted based on
 *  specific requirements (e.g., allowed characters, maximum length).
 *
 * @param {string} filename The string to check.
 * @returns {boolean} True if the filename is valid, false otherwise.
 */
function isValidFilename(filename) {
    // Basic check:  Disallow characters typically invalid in filenames
    //  on most operating systems:  < > : " / \ | ? *
    //  Also disallow control characters (ASCII 0-31 and 127).
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F\x7F]/;
    if (invalidCharsRegex.test(filename)) {
        return false;
    }

    // Check for empty string or only whitespace
    if (!filename.trim()) {
      return false;
    }

    // Check for leading/trailing whitespace
    if (filename.trim() !== filename) {
        return false;
    }

    // Optional: Check for maximum length (e.g., 255 characters)
    if (filename.length > 255) {
      return false;
    }

    // Optional: Add more specific checks here, if needed.
    //  For example:
    //  - Check for specific allowed extensions (e.g., .pdf, .jpg, .png)
    //  - Check for reserved filenames (e.g., CON, PRN, AUX, NUL on Windows)

    return true;
}
