import {
    IClickable,
    INamedObject,
    ISlotItem,
    ISlotVisualItem,
    IStageObject,
    ITypedObject,
    IHealthBarOwner, IVisualNumericRep, ObjectType
} from "./GameObjectBase";

export class SlotItem {

    constructor(type, slot, stage, health, drop, targetSlot) {
        this._slot = slot
        this._stage = stage
        this._maxHealth = health
        this._currentHealth = health
        this._drop = drop
        this._targetSlot = targetSlot

        this._animIdx = 0
        this._shakeAnimation = []
        this._currentClick = 0

        Object.assign(this, ITypedObject(type))
        Object.assign(this, IStageObject(stage))
        Object.assign(this, INamedObject(this))

        Object.assign(this, ISlotItem(slot))
        Object.assign(this, ISlotVisualItem(this, type))
        Object.assign(this, IHealthBarOwner(this))
        if (window.GD.config.MODE === 'development') {
            Object.assign(this, IVisualNumericRep(this, 'stage', -0.3, 0.25, 0xCCCC00))
            Object.assign(this, IVisualNumericRep(this, 'targetSlot', 0.3, 0.25, 0xAA0000))
        }
        Object.assign(this, IClickable(this))

        const shakeTime = 0.25
        const shakeOffset = 1
        const easeConfig = RoughEase.ease.config({strength:10, points:40, template:Linear.easeNone, randomize:false})
        this._shakeAnimation = [
            TweenLite.fromTo(
                this.visual, shakeTime,
                {x:this.visual.x-shakeOffset},
                {x:this.visual.x+shakeOffset, ease:easeConfig}),
            TweenLite.fromTo(
                this.visual, shakeTime,
                {y:this.visual.y-shakeOffset},
                {y:this.visual.y+shakeOffset, ease:easeConfig})
        ]
        this._shakeAnimation[0].pause()
        this._shakeAnimation[1].pause()
    }

    get drop() { return this._drop }
    get health() { return this._currentHealth }
    get targetSlot() { return this._targetSlot }

    processDamage(value) {
        this._currentHealth = Math.max(0, this._currentHealth-value)
        this.setHealthBarValue(this._currentHealth/this._maxHealth)

        this._shakeAnimation[this._animIdx].restart()
        this._animIdx = this._animIdx === 0 ? 1 : 0

        this._currentClick += 1
        return this._currentClick % 3 === 0 // reward with intermediate gold
    }

    clear(animation) { // TODO: this here should be an animation
        const self = this
        return new Promise((resolve, reject) => {

            self._shakeAnimation[0].kill()
            self._shakeAnimation[1].kill()

            self.healthbarVisual.destroy()
            if (window.GD.config.MODE === 'development') {
                self.stageDestroy()
                self.targetSlotDestroy()
            }

            self.visual.interactive = false
            if (self._drop[ObjectType.PAID_EGG] || self._drop[ObjectType.EGG]) {
                self._drop = null
                animation.launch(self.visual, 0.5, () => {
                    self.visual.destroy()
                    resolve()
                })
            } else {
                animation.launch(self.visual, 2.5, () => {
                    self.visual.destroy()
                    resolve()
                })
            }
        })
    }
}