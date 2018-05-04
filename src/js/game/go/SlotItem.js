import {
    IClickable,
    INamedObject,
    ISlotItem,
    ISlotVisualItem,
    IStageObject,
    ITypedObject,
    IHealthBarOwner, IVisualStageRepresentationOwner
} from "./GameObjectBase";

export const SlotItem = (type, slot, stage, health, drop) => {

    let maxHealth = health
    let currentHealth = maxHealth

    let animIdx = 0
    let shakeAnimation = []
    let currentClick = 0

    const self = {
        get drop() { return drop },
        get health() { return currentHealth },
        processDamage: value => {
            currentHealth = Math.max(0, currentHealth-value)
            self.setHealthBarValue(currentHealth/maxHealth)

            shakeAnimation[animIdx].restart()
            animIdx = animIdx === 0 ? 1 : 0

            currentClick += 1
            return currentClick % 3 === 0 // reward with intermediate gold
        },
        clear() { // TODO: this here should be an animation
            return new Promise((resolve, reject) => {
                drop = null

                shakeAnimation[0].kill()
                shakeAnimation[1].kill()

                self.healthbarVisual.destroy()
                if (window.GD.config.MODE === 'development') {
                    self.stageRepVisual.destroy()
                }
                self.visual.destroy()
                resolve()
            })
        }
    }

    Object.assign(self, ITypedObject(type))
    Object.assign(self, IStageObject(stage))
    Object.assign(self, INamedObject(self))

    Object.assign(self, ISlotItem(slot))
    Object.assign(self, ISlotVisualItem(self, type))
    Object.assign(self, IHealthBarOwner(self))
    if (window.GD.config.MODE === 'development') {
        Object.assign(self, IVisualStageRepresentationOwner(self))
    }
    Object.assign(self, IClickable(self))

    const shakeTime = 0.25
    const shakeOffset = 1
    const easeConfig = RoughEase.ease.config({strength:10, points:40, template:Linear.easeNone, randomize:false})
    shakeAnimation[0] = TweenLite.fromTo(
        self.visual, shakeTime,
        {x:self.visual.x-shakeOffset},
        {x:self.visual.x+shakeOffset, ease:easeConfig}
    )
    shakeAnimation[1] = TweenLite.fromTo(
        self.visual, shakeTime,
        {y:self.visual.y-shakeOffset},
        {y:self.visual.y+shakeOffset, ease:easeConfig}
    )
    shakeAnimation[0].pause()
    shakeAnimation[1].pause()

    return self
}