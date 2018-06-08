import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./screen/game/SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";
import {GoldCounter} from "./ui/GoldCounter";
import {ObjectType} from "./go/GameObjectBase";
import {CoinParticlesManager} from "./screen/game/CoinParticlesManager";
import {ObjectPool} from "../utils/ObjectPool";
import {DamagePercent} from "./ui/debugDamagePercent";
import {DestroyAnimation} from "./screen/DestroyAnimation";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        this.uiCreator = UIFactory.forParent(this.type)

        const fs = this.uiCreator.getFullScreenButton(
            owner.renderer.dom,
            {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 40})
        fs && this.addControl(fs)

        if (this._owner.model.slotItems.length === 3) {
            this.addControl(this.uiCreator.getNavButton(
                owner, SCREEN_TYPE.UPGRADE,
                'ui_upgrade', {x: 0, y: 0}, {x: 'left', xOffset: 40, y: 'top', yOffset: 40}))
        }

        if (window.GD.config.MODE !== 'production') {
            this.addControl(this.uiCreator.getButton2('ui_restart', () => {
                if (window.confirm('прогресс будет сброшен. продолжить?')) {
                    this._owner.model.restart()
                }
            }, {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 160}))
        }

        this._goldCounter = GoldCounter({x: 'center', xOffset: 10, y: 'bottom', yOffset: 400}, this._owner.model.gold)
        this.add(this._goldCounter)

        this._particles = CoinParticlesManager(this, this._goldCounter.visual)
        this.add(this._particles)

        this._generator = SlotItemGenerator(this, owner.model, this._owner.model.stageItems)
        this._slotItems = [null, null, null]
        if (this._owner.model.slotItems.length > 0) {
            this._owner.model.slotItems.forEach((dataItem, i) => {
                if (dataItem === null) return
                this._generator.populateConcrete(this._slotItems, i, dataItem)
            })
        } else {
            this._generator.populateAtGameStart(this._slotItems)
        }

        const self = this
        const dragons = this._owner.model.dragons
        Object.keys(dragons).forEach(tier => {
            dragons[tier].forEach(dragonData => {
                self._owner.dragonManager.addVisualDragon(dragonData.tier, dragonData.level)
            })
        })

        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)
        this._itemDestroyAnimPool = ObjectPool(DestroyAnimation, [], 3)
        if (window.GD.config.MODE === 'development') {
            this._clickDamageVisPool = ObjectPool(DamagePercent, [_self => {
                self.remove(_self)
            }], 10)
        }

        this._savedRewards = []
    }

    _dropGold(i, dropData, value) {
        const self = this
        // console.log(this._slotItems[i])
        dropData[ObjectType.GOLD] -= value
        self._owner.model.addGold(value)
        self._particles.dropCoin(i, value)
        self._goldCounter.setValue(this._owner.model.gold)
        window.GA.accumulate('gold', {stage: this._slotItems[i].stage, num: value})
    }

    onViewportSizeChanged() {
        this._owner.dragonManager.updateCommonBounds(
            50, this._owner.renderer.size.x-50,
            50, this._owner.renderer.size.y-450
        )
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)
        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

        this.onViewportSizeChanged()

        while(this._savedRewards.length) {
            this._savedRewards.shift()()
        }
    }

    animateHide(to, onComplete) {
        this._slotItems.forEach(si => si.disable())
        super.animateHide(to, onComplete)
    }

    animateShow(from, onComplete) {
        super.animateShow(from, () => {
            this._slotItems.forEach(si => si.enable())
            onComplete()
        })
    }

    update(dt) {
        super.update(dt)

        this._particles.update(dt)
        this._slotItems.forEach((c, i) => {
            if (c === null) return
            const clicks = c.extractClicks()
            if (clicks > 0) {
                window.GA.accumulate('clicks', {num: clicks, stage: c.stage})
                const targetDmg = window.GD.getTargetDamage(c.stage)
                if (window.GD.config.MODE === 'development') {
                    const dmgVis = this._clickDamageVisPool.getOne()
                    this.add(dmgVis)
                    dmgVis.launch(`${Math.round((this._clickDamage / targetDmg) * 100)}%`, c.visual.x, c.visual.y)
                }

                const totalDamage = clicks * this._clickDamage
                const clickDamage = Math.floor(totalDamage * window.GD.clickSourceDamage)
                const dragonDamage = totalDamage - clickDamage
                this._owner.dragonManager.attack(i, dragonDamage)
                this.processSlotDamage(i, 'click', clickDamage)
            }
        })
    }

    processSlotDamage(slotIdx, source, damage) {
        const slotItem = this._slotItems[slotIdx]
        if (slotItem.health <= 0) {
            // console.log('slot item already destroying, but got damage from source ', source)
            return
        }
        const rewardingClick = slotItem.processDamage(damage)
        const drop = slotItem.drop
        const dropsGold = typeof drop[ObjectType.GOLD] !== "undefined"
        const dropsDragon = typeof drop[ObjectType.DRAGON] !== "undefined"
        const dropsEgg = typeof drop[ObjectType.EGG] !== "undefined"
        if (slotItem.health <= 0) {
            const reward = () => {
                slotItem.clear(this._itemDestroyAnimPool.getOne()).then(() => {
                    this.remove(slotItem)
                    this._slotItems[slotIdx] = null
                    if (dropsEgg) {
                        this._generator.populateConcrete(
                            this._slotItems, slotIdx, drop[ObjectType.EGG]
                        )
                    } else {
                        this._generator.populate(this._slotItems)
                    }
                })
                if (dropsGold) {
                    this._dropGold(slotIdx, drop, drop[ObjectType.GOLD])
                }
                if (dropsDragon) {
                    if (this._owner.model.dragonsCount === 0) {
                        this.addControl(this.uiCreator.getNavButton(
                            this._owner, SCREEN_TYPE.UPGRADE,
                            'ui_upgrade', {x: 0, y: 0}, {x: 'left', xOffset: 40, y: 'top', yOffset: 40}))
                        TweenLite.from(this._controls[this._controls.length-1].visual, 1, {x: -80})
                    }
                    const dragonData = drop[ObjectType.DRAGON]
                    this._owner.model.addDragon(dragonData.tier, dragonData.level)
                    this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

                    this._owner.dragonManager.addVisualDragon(dragonData.tier, dragonData.level, this._slotItems[slotIdx].visual)
                }
            }
            if (this._active && !this._hiding) {
                reward()
            } else {
                this._savedRewards.push(reward)
            }
        } else if (rewardingClick && dropsGold) {
            const reward = () => {
                const intermediateGold = Math.max(1, Math.floor(drop[ObjectType.GOLD] * 0.002))
                this._dropGold(slotIdx, drop, intermediateGold)
            }
            if (this._active && !this._hiding) {
               reward()
            } else {

            }
        }
    }
}