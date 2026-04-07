/** Pakistan — provinces / administrative areas for shipping */
const states = [
    { code: 'PB', name: 'Punjab' },
    { code: 'SD', name: 'Sindh' },
    { code: 'KP', name: 'Khyber Pakhtunkhwa' },
    { code: 'BA', name: 'Balochistan' },
    { code: 'ICT', name: 'Islamabad Capital Territory' },
    { code: 'GB', name: 'Gilgit-Baltistan' },
    { code: 'AJK', name: 'Azad Jammu and Kashmir' },
];

export function stateNameByCode(code) {
    if (!code) return '';
    const s = states.find((x) => x.code === code);
    return s ? s.name : String(code);
}

export default states;
