import {
    IClickable,
    ObjectType
} from "../behaviours/Base";
import {IAdoptable} from "../behaviours/IAdoptable";
import {FlashAnimationVisual} from "./FlashAnimationVisual";
import {DAMAGE_SOURCE} from "./DamageSource";

export class SlotItem {

    constructor(type, slot, stage, health, drop, targetSlot, opener, healthbar) {
        this._type = type
        this._slot = slot
        this._stage = stage
        this._maxHealth = health
        this._depletedHealthPiece = 0
        this._currentHealth = health
        this._drop = drop
        this._targetSlot = targetSlot
        this._opener = opener
        this._healthbar = healthbar
        healthbar.visual.visible = false

        this._animIdx = 0
        this._shakeAnimation = []
		this._showAnimation = null
        this._currentClick = 0

        if (type === ObjectType.CHEST) {
            if (slot === 0) {
                Object.assign(this, FlashAnimationVisual('animation_chest_small', 'chest_small', stage, type, slot))
            } else
            if (slot === 1) {
                Object.assign(this, FlashAnimationVisual('animation_chest_medium', 'chest_medium', stage, type, slot))
            } else
            if (slot === 2) {
                Object.assign(this, FlashAnimationVisual('animation_chest_big', 'chest_big', stage, type, slot))
            }
			
        }
        else if (type === ObjectType.EGG) {
            Object.assign(this, FlashAnimationVisual('animation_egg', 'egg_regular', stage, type, slot, [
                'egg_regular_stage0', 'egg_regular_stage1', 'egg_regular_stage2'
            ], drop.dragon.tier))
            this.setCrutchState(0.999)
        }
        else if (type === ObjectType.PAID_EGG) {
            Object.assign(this, FlashAnimationVisual('animation_egg', 'egg_premium', stage, type, slot, [
                'egg_premium_stage1', 'egg_premium_stage2'
                ]))
            this.setCrutchState(0.999)
        }
        else if (type === ObjectType.PAID_CHEST) {
            Object.assign(this, FlashAnimationVisual('animation_chest_premium', 'chest_premium', stage, type, slot))
        } else {
            throw 'Fallback type? not possibru'
        }
        Object.assign(this, IClickable(this))
        this.visual.interactive = false
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
        this._enabled = false
    }

	get type() { return this._type }
	get slot() { return this._slot }
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
		
		if (this._showAnimation == null) {
			if (this._type === ObjectType.CHEST || this._type === ObjectType.PAID_CHEST) {
				this._showAnimation = TweenLite.fromTo(
						this.visual, 1.1,
						{pixi: {alpha:0.4, y:this.visual.y - 600, scaleX:this.visual.scale.x * 0.6, scaleY:this.visual.scale.y * 0.6}},
						{pixi: {alpha:1, y:this.visual.y, scaleX:this.visual.scale.x, scaleY:this.visual.scale.y}, ease:Bounce.easeOut, onComplete: () => {
                                this._enabled = true
                                this.visual.interactive = true
                                this._healthbar.resetHealthBarValue()
                                this._healthbar.visual.visible = true
                            }})
							
                window.soundman.play('sound_sfx', 'chestDrop', 0.5)

			} else if (this._type === ObjectType.EGG || this._type === ObjectType.PAID_EGG) {
				this._showAnimation = TweenLite.fromTo(
						this.visual, 0.5,
						{pixi: {y:this.visual.y - 100, scaleX:this.visual.scale.x * 0.8, scaleY:this.visual.scale.y * 0.8}},
						{pixi: {y:this.visual.y, scaleX:this.visual.scale.x, scaleY:this.visual.scale.y}, ease:Back.easeIn.config(5.7), onComplete: () => {
                                this._enabled = true
                                this.visual.interactive = true
                                this._healthbar.resetHealthBarValue()
                                this._healthbar.visual.visible = true
                            }})
			} else {
                this.visual.interactive = true
            }
        }
    }

    processDamage(value, source) {
        this._depletedHealthPiece += value
        this._currentHealth = Math.max(0, this._currentHealth-value)
        this._healthbar.setHealthBarValue(this._currentHealth/this._maxHealth)

        if (this._type.indexOf('egg') > -1) {
            this.setCrutchState(this._currentHealth / this._maxHealth)
        }
		
		var soundNum = 1;
		var soundDamage = value / this._maxHealth
		if (soundDamage > 0.1) soundNum = Math.random() > 0.5 ? 1 : 2
		else if (soundDamage > 0.05) soundNum = Math.random() > 0.5 ? 3 : 4
		else if (soundDamage > 0.02) soundNum = Math.random() > 0.3 ? 6 : 5
		else soundNum = 7
        const volume = source === DAMAGE_SOURCE.CLICK ? 0.45 : 0.1 + Math.random() * 0.15
        window.soundman.play('sound_sfx', `dmg${soundNum}`, volume)
		
        if (this._enabled) {
            this._shakeAnimation[this._animIdx].restart()
        }
        this._animIdx = this._animIdx === 0 ? 1 : 0

        if (this._depletedHealthPiece/this._maxHealth > 0.1) { // reward with intermediate gold every 10% hp
		    this._depletedHealthPiece = 0
            return true
        } else {
		    return false
        }
    }

    animateOpen() {
        this._healthbar.visual.visible = false
        this._healthbar = null
        const self = this
        return new Promise(resolve => {
            self.visual.interactive = false

            self._shakeAnimation[0].kill()
            self._shakeAnimation[1].kill()

            // self.healthbarVisual.destroy()
            self.stageDestroy && self.stageDestroy()

            if (self.play) {
                self.play().then(resolve)
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