/**
 * Normalize Pakistani mobile numbers to 10 digits starting with 3 (e.g. 3001234567).
 * Accepts: 3XXXXXXXXX, 03XXXXXXXXX, 923XXXXXXXXX, +92 3XX XXXXXXX, etc.
 */
export function normalizePakMobile(input) {
    const d = String(input).replace(/\D/g, '');
    if (!d) return null;

    let mobile = d;
    if (mobile.startsWith('0092')) mobile = mobile.slice(4);
    else if (mobile.startsWith('92') && mobile.length >= 12) mobile = mobile.slice(2);

    if (mobile.length === 11 && mobile.startsWith('03')) mobile = mobile.slice(1);

    if (mobile.length === 10 && /^3[0-9]{9}$/.test(mobile)) return mobile;
    return null;
}

export function isValidPakMobile(input) {
    return normalizePakMobile(input) !== null;
}
