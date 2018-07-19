import {
    IClickable,
    IHealthBarOwner, IVisualNumericRep, ObjectType, IVisual
} from "../behaviours/Base";
import {IAdoptable} from "../behaviours/IAdoptable";
import {VisualChest} from "./VisualChest";

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

        if (type === ObjectType.CHEST) {
            Object.assign(this, VisualChest())
            Object.assign(this, IHealthBarOwner(this, {x: 38, y: 50}))
            Object.assign(this, IVisualNumericRep(this, 'stage', 0.2, 1, 0xCCCC00, 0.25))
            Object.assign(this, IClickable(this, true))
        } else {
            Object.assign(this,
                IVisual(type)
                    .setSize(window.GD.slots[slot].w, window.GD.slots[slot].h)
            )
            Object.assign(this, IHealthBarOwner(this))
            Object.assign(this, IVisualNumericRep(this, 'stage', -0.3, 0.25, 0xCCCC00))
            Object.assign(this, IClickable(this))
        }
        this._adopter = IAdoptable(this.visual, window.GD.slots[slot].pivotRules)

        const shakeTime = 0.25
        const easeConfig = RoughEase.ease.config({strength:10, points:40, template:Linear.easeNone, randomize:false})
        this._shakeAnimation = [
            TweenLite.fromTo(
                this.visual, shakeTime,
                {x:this.visual.x},
                {x:this.visual.x, ease:easeConfig}),
            TweenLite.fromTo(
                this.visual, shakeTime,
                {y:this.visual.y},
                {y:this.visual.y, ease:easeConfig})
        ]
        this._shakeAnimation[0].pause()
        this._shakeAnimation[1].pause()
        this._enabled = true
    }

    get stage() { return this._stage }
    get drop() { return this._drop }
    get health() { return this._currentHealth }
    get targetSlot() { return this._targetSlot }

    disable() {
        this._enabled = false
        this._shakeAnimation[0].pause()
        this._shakeAnimation[1].pause()
    }

    enable() {
        this._enabled = true
    }

    // override method
    adopt(currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr) {
        this._shakeAnimation[0].invalidate()
        this._shakeAnimation[1].invalidate()

        this._adopter.adopt(currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr)

        const shakeOffset = 1
        this._shakeAnimation[0].vars.startAt.x = this.visual.x - shakeOffset
        this._shakeAnimation[0].vars.x = this.visual.x + shakeOffset

        this._shakeAnimation[1].vars.startAt.y = this.visual.y - shakeOffset
        this._shakeAnimation[1].vars.y = this.visual.y + shakeOffset
    }

    processDamage(value, source) {
        this._currentHealth = Math.max(0, this._currentHealth-value)
        this.setHealthBarValue(this._currentHealth/this._maxHealth)

        if (this._enabled) {
            this._shakeAnimation[this._animIdx].restart()
        }
        this._animIdx = this._animIdx === 0 ? 1 : 0

        this._currentClick += 1
        return this._currentClick % 3 === 0 // reward with intermediate gold
    }

    animateOpen() {
        return new Promise(resolve => {
            this.visual.interactive = false

            this._shakeAnimation[0].kill()
            this._shakeAnimation[1].kill()

            this.healthbarVisual.destroy()
            this.stageDestroy()

            if (this.play) {
                this.play().then(resolve)
            } else {
                resolve()
            }
        })
    }

    clear(animation) {
        const self = this
        return new Promise(resolve => {
            if (self._drop[ObjectType.PAID_EGG] || self._drop[ObjectType.EGG]) {
                self._drop = null
                animation.initialize(self.visual, 0.25, 0.7, () => {
                    self.visual.destroy()
                    resolve()
                })
            } else {
                animation.initialize(self.visual, 0.4, 0.7, () => {
                    self.visual.destroy()
                    resolve()
                })
            }
        })
    }
}