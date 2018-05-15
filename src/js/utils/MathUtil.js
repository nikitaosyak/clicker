
const letters = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'D', 'U']
export const MathUtil  = {
    roundToDigit: (value, digit) => {
        return Math.round(value * Math.pow(10, digit)) / Math.pow(10, digit)
    },
    convert: value => {
        const pow = Math.floor(Math.log10(value)/3)
        const letter = letters[pow]
        return `${MathUtil.roundToDigit(value/Math.pow(10, pow*3), 2)}${letter}`
    }
}