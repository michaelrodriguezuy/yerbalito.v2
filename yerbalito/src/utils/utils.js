export const calculateCedulaVerifier = (cedula) => {
    const digits = cedula.split('').map(Number);
    const multipliers = [2, 9, 8, 7, 6, 3, 4];
    const sum = digits.reduce((acc, digit, index) => acc + digit * multipliers[index], 0);
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
}