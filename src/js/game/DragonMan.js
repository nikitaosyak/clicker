import {Dragon} from "./go/Dragon";
import {ObjectPool} from "../utils/ObjectPool";
import {DragonProjectile} from "./go/DragonProjectile";

export const DragonMan = renderer => {

    let gameScreen = null
    const dragons = []

    const commonBounds = { left: 0,right: 0, top: 0, bottom: 0, active: false }

    let damageToDistribute = [0, 0, 0]
	let lastFocusedSlot = 0
	let lastDamage = 0
    const GLOBAL_ATTACK_COOLDOWN = 5 //ms
    let lastAttack = -1

    const projectilePool = ObjectPool(DragonProjectile, [(self) => {
        gameScreen.processSlotDamage(self.slotIdx, 'dragon', self.damage)
        gameScreen.remove(self)
    }], 3)

    const self = {
        injectGameScreen: _gameScreen => gameScreen = _gameScreen,
        attack: (slotIdx, damage) => {
            if (dragons.length === 0) {
                gameScreen.processSlotDamage(slotIdx, 'dragons', damage)
                return
            }

            damageToDistribute[slotIdx] += damage
			lastFocusedSlot = slotIdx;
			lastDamage = damage;
        },
        update: dt => {
            dragons.forEach(d => d.update(dt))

            if (damageToDistribute.reduce((acc, slotDamage) => acc + slotDamage, 0) <= 0) return
            if (Date.now() - lastAttack < GLOBAL_ATTACK_COOLDOWN) return
			var sumDmg = damageToDistribute[0] + damageToDistribute[1] + damageToDistribute[2]
			var spdMul = 0.2 + (lastDamage / sumDmg * 2)
            const available = dragons.filter(d => d.canAttack(spdMul))
            if (available.length === 0) return
            for (let i = 0 ; i < available.length; i++) {
                const singleAvailable = available[i]
                const damage = window.GD.getSingleDragonDamage(singleAvailable.tier, singleAvailable.level)
                let wasAttack = false
                for (let j = 0; j < damageToDistribute.length; j++) {
                    if (damageToDistribute[j] <= 0) continue
                    // here is the point of assigning some damage

                    const finalDamage = Math.min(damageToDistribute[j], damage)
                    damageToDistribute[j] = Math.max(0, damageToDistribute[j] - damage)

                    const projectile = projectilePool.getOne()
                    gameScreen.add(projectile)
                    projectile.launch(finalDamage, j,
                        singleAvailable.tier,
                        singleAvailable.visual.x, singleAvailable.visual.y,
                        window.GD.slots[j].x, window.GD.slots[j].y)

                    singleAvailable.setAttackFlag()

                    lastAttack = Date.now()
                    wasAttack = true
                    break
                }
                if (wasAttack) break
            }
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