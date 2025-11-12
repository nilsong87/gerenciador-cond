// modules/validation.js

/**
 * Validates an email address using a regular expression.
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validates a password for minimum length.
 * @param {string} password The password to validate.
 * @param {number} minLength The minimum allowed length for the password.
 * @returns {boolean} True if the password meets the minimum length, false otherwise.
 */
function validatePassword(password, minLength = 6) {
    return password.length >= minLength;
}

/**
 * Validates a file before upload based on type and size.
 * @param {File} file The file object to validate.
 * @param {Array<string>} allowedTypes An array of allowed MIME types (e.g., ['image/jpeg', 'image/png']).
 * @param {number} maxSizeInBytes The maximum allowed file size in bytes.
 * @returns {string|null} An error message if validation fails, otherwise null.
 */
function validateFile(file, allowedTypes, maxSizeInBytes) {
    if (!file) {
        return "Nenhum arquivo selecionado.";
    }

    if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}.`;
    }

    if (maxSizeInBytes && file.size > maxSizeInBytes) {
        const maxSizeMB = maxSizeInBytes / (1024 * 1024);
        return `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeMB.toFixed(2)} MB.`;
    }

    return null; // No error
}

export { validateEmail, validatePassword, validateFile };