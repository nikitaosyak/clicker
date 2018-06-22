
const letters = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'D', 'U']
export const MathUtil  = {
    roundToDigit: (value, digit) => {
        return Math.round(value * Math.pow(10, digit)) / Math.pow(10, digit)
    },
    convert: value => {
        if (Math.abs(value) < 0.00001) return '0'

        const pow = Math.floor(Math.log10(value)/3)
        const letter = letters[pow]
        return `${MathUtil.roundToDigit(value/Math.pow(10, pow*3), 2)}${letter}`
    },
    clamp: (min, max, v) => Math.max(min,Math.min(max,v)),
    lerp: (v0, v1, t) => v0*(1-t)+v1*t
}