import {IAnimated, IUnimportantContent} from "../../behaviours/Base";

export const DragonProjectile = (pool, onComplete) => {

    let animation = null
    let currentDamage = 0; let currentSlotIdx = 0;
    const self = {
        get damage() { return currentDamage },
        get slotIdx() { return currentSlotIdx },
        launch: (damage, slotIdx, tier, fromX, fromY, toX, toY) => {
            const projSpeed = [-1, 500, 520, 550, 580, 600, 620, 650, 680, 700, 750][tier]

            currentDamage = damage
            currentSlotIdx = slotIdx

            self.visual.x = fromX
            self.visual.y = fromY
            self.visual.tint = [-1, 0x28984a, 0x7835dd, 0xd52622, 0xd5226a, 0x3478dd, 0x612e5a][tier]

            const w = Math.abs(toX - fromX)
            const h = Math.abs(toY - fromY)
            const path = Math.sqrt(w*w + h*h)

            animation.duration = path / projSpeed
            animation.target = self.visual
            animation.vars.pixi.x = toX
            animation.vars.pixi.y = toY
            animation.invalidate()
            animation.restart(false, false)
        }
    }

    Object.assign(self, IAnimated('dragons_projectile_fireball').setSize(32, 32))
    Object.assign(self, IUnimportantContent())

    animation = TweenLite.to(
        self.visual, 2, {pixi: {x: 0, y: 0}, roundProps: 'x,y', ease:Power1.easeIn, onComplete: () => {
            onComplete(self)
            pool.putOne(self)
            }})
    animation.pause()

    return self
}