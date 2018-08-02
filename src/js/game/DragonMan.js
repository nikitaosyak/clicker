import {Dragon} from "./Dragon";
import {ObjectPool} from "./poolable/ObjectPool";
import {DragonProjectile} from "./poolable/DragonProjectile";
import {DAMAGE_SOURCE} from "./DamageSource";

export const DragonMan = (renderer, clickDamage) => {

    /** @type {GameScreen} */
    let gameScreen = null
    const dragons = []

    const commonBounds = { left: 0,right: 0, top: 0, bottom: 0 }
    let canUpdateDragonBounds = true
    let holdAttack = false

    let damageToDistribute = [0, 0, 0]
	let lastFocusedSlot = 0
	let lastDamage = clickDamage
    const GLOBAL_ATTACK_COOLDOWN = 1 //ms, below 16 means attack every frame
    let lastAttack = -1

    const projectilePool = ObjectPool(DragonProjectile, [(self) => {
        gameScreen.processSlotDamage(self.slotIdx, DAMAGE_SOURCE.DRAGON, self.damage)
        gameScreen.remove(self)
    }], 3)

    const self = {
        get dragons() { return dragons },
        injectGameScreen: _gameScreen => gameScreen = _gameScreen,
        set canUpdateBounds(value) { canUpdateDragonBounds = value },
        set holdAttack(value) { holdAttack = value },
        attack: (slotIdx, damage) => {
            if (dragons.length === 0) {
                gameScreen.processSlotDamage(slotIdx, DAMAGE_SOURCE.CLICK, damage)
                return
            }

            damageToDistribute[slotIdx] += damage
			lastFocusedSlot = slotIdx;
			lastDamage = damage;
        },
        update: dt => {
            dragons.forEach(d => d.update(dt))

            if (Date.now() - lastAttack < GLOBAL_ATTACK_COOLDOWN) return

            if (!gameScreen.active) return

            const autoDamageMult = 0.001;
            damageToDistribute[0] += lastDamage * autoDamageMult
            damageToDistribute[1] += lastDamage * autoDamageMult
            damageToDistribute[2] += lastDamage * autoDamageMult

			// console.log("acc dmg:  " + Math.round(damageToDistribute[0]) + '  '  + Math.round(damageToDistribute[1]) + '  '  + Math.round(damageToDistribute[2]) + '  ' )
			
            const sumDmg = damageToDistribute[0] + damageToDistribute[1] + damageToDistribute[2]
            if (sumDmg <= 0) return
			var spdMul = 0.3 + (lastDamage / sumDmg * 6)
			
            const available = dragons.filter(d => d.canAttack(spdMul))
            if (available.length === 0) return
            for (let i = 0 ; i < available.length; i++) {
                const singleAvailable = available[i]
                const damage = window.GD.getSingleDragonDamage(singleAvailable.tier, singleAvailable.level)
                let wasAttack = false
                for (let j = 0; j < damageToDistribute.length; j++) {
                    if (damageToDistribute[j] < damage) continue //dragon cant attack for half of his power
                    if (!gameScreen.isSlotLive(j)) continue //no reason to attack empty slot
					// here is the point of assigning some damage

                    if (canUpdateDragonBounds) {
                        const slotDragonAreaRange = 150
                        singleAvailable.setLocalBounds(
                            gameScreen._slotItems[j].visual.x - slotDragonAreaRange,
                            gameScreen._slotItems[j].visual.x + slotDragonAreaRange,
                            commonBounds.top + 50,
                            commonBounds.bottom
                        )
                    }
                    if (holdAttack) continue

                    const finalDamage = Math.min(damageToDistribute[j], damage)
                    damageToDistribute[j] = Math.max(0, damageToDistribute[j] - damage)

                    singleAvailable.scheduleAttack().then((offset) => {
                        const projectile = projectilePool.getOne()
                        gameScreen.add(projectile)

                        projectile.launch(finalDamage, j,
                            singleAvailable.tier,
                            singleAvailable.visual.x + offset.x, singleAvailable.visual.y + offset.y,
                            gameScreen._slotItems[j].visual.x, gameScreen._slotItems[j].visual.y)
                    })

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
            dragons.sort((a, b) => {
                if (window.GD.getSingleDragonDamage(a.tier, a.level) > window.GD.getSingleDragonDamage(b.tier, b.level)) return -1
                if (window.GD.getSingleDragonDamage(a.tier, a.level) < window.GD.getSingleDragonDamage(b.tier, b.level)) return 1
                return 0
            })
            renderer.addObject(d)
        },
        getVisualDragons: (tier, level) => {
            return dragons.filter(sh => {if (sh.tier === tier && sh.level === level) return sh})
        },
        setCommonBounds: (left, right, top, bottom) => {
            commonBounds.left = left; commonBounds.right = right;
            commonBounds.top = top; commonBounds.bottom = bottom;
            dragons.forEach(d => d.deactivateLocalBounds())
        },
        setBatchLocalBounds: (tier, level, left, right, top, bottom) => {
            self.getVisualDragons(tier, level).forEach(d => d.setLocalBounds(left, right, top, bottom))
        }
    }
    return self
}
