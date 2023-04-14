export const regexValidator = (text: string, pattern: RegExp): boolean => {
    const regex = new RegExp(pattern);
    return regex.test(text);
}
