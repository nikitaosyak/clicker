import {Dragon} from "./go/Dragon";

export const DragonMan = renderer => {

    const dragons = []
    const projectiles = []
    const commonBounds = { left: 0,right: 0, top: 0, bottom: 0, active: false }

    const self = {
        attack: (damage, processDamage) => {

        },
        update: dt => {
            dragons.forEach(d => d.update(dt))
        },
        addVisualDragon: (tier, level, location = undefined) => {
            const d = Dragon(commonBounds, tier, level,
                location ? location.x : 100 + Math.round(Math.random()*500),
                location ? location.y : 100 + Math.round(Math.random()*500))
            dragons.push(d)
            renderer.addObject(d)
        },
        getVisualDragons: (tier, level) => {
            return dragons.filter(sh => {if (sh.tier === tier && sh.level === level) return sh})
        },
        updateCommonBounds: (left, right, top, bottom) => {
            commonBounds.left = left; commonBounds.right = right;
            commonBounds.top = top; commonBounds.bottom = bottom;
            commonBounds.active = true
        },
        updateSpecificBounds: (tier, level, left, right, top, bottom) => {
            commonBounds.active = false
            self.getVisualDragons(tier, level).forEach(d => d.setLocalBounds(left, right, top, bottom))
        }
    }
    return self
}