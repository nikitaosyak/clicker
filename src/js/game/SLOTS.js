
const rects = [
    {x: 140, y: 1100, w: 250, h: 300},
    {x: 400, y: 1100, w: 250, h: 300},
    {x: 660, y: 1100, w: 250, h: 300}
]

export const SLOTS = {
    get total() { return 3 },
    getRect(at) { return rects[at] }
}