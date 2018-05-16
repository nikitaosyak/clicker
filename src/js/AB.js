
export const AB = {
    DRAGONS: 1,
    GOLDPACKS: 2,
    selectAB: () => {
        const r = Math.random()
        if (r < 0.33) return AB.DRAGONS
        if (r < 0.66) return AB.GOLDPACKS
        return AB.DRAGONS | AB.GOLDPACKS
    }
}