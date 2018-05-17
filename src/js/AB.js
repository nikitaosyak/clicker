
export const AB = {
    DRAGONS: 1,
    GOLDPACKS: 2,
	COMBINE: 3,
    selectAB: () => {
        const r = Math.random()
        if (r < 0.33) return AB.DRAGONS
        if (r < 0.66) return AB.GOLDPACKS
        return AB.DRAGONS | AB.GOLDPACKS
    },
    strValue: ab => {
        let val = []
        if ((AB.DRAGONS&ab) > 0) val.push('dragons')
        if ((AB.GOLDPACKS&ab) > 0) val.push('gold')
        return val.join(' and ')
    }
}