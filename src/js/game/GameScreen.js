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

        const uiCreator = UIFactory.forParent(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        if (this._owner.model.slotItems.length === 3) {
            this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80))
        }
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.LEADERBOARD, 'ui_leaderboard', 720, 180))
        if (window.GD.config.MODE !== 'production') {
            this.addControl(uiCreator.getButton('ui_restart', 80, 180, () => {
                if (window.confirm('прогресс будет сброшен. продолжить?')) {
                    this._owner.model.restart()
                }
            }))
        }

        this._goldCounter = GoldCounter(520, 800, this._owner.model.gold)
        this.add(this._goldCounter)

        this._particles = CoinParticlesManager(this._goldCounter.visual)
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

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)
        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

        this._owner.dragonManager.updateCommonBounds(50, 750, 50, 750)
    }

    update(dt) {
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
                const self = this
                this._owner.dragonManager.attack(dragonDamage, damage => {
                    self.processSlotDamage(i, 'dragon', damage)
                })

                this.processSlotDamage(i, 'click', clickDamage)
            }
        })
    }

    processSlotDamage(slotIdx, source, damage) {
        const slotItem = this._slotItems[slotIdx]
        if (slotItem.health <= 0) {
            console.log('slot item already destroying, but got damage from source ', source)
            return
        }
        const rewardingClick = slotItem.processDamage(damage)
        const dropsGold = typeof slotItem.drop[ObjectType.GOLD] !== "undefined"
        const dropsDragon = typeof slotItem.drop[ObjectType.DRAGON] !== "undefined"
        const dropsEgg = typeof slotItem.drop[ObjectType.EGG] !== "undefined"
        if (slotItem.health <= 0) {
            slotItem.clear(this._itemDestroyAnimPool.getOne()).then(() => {
                this.remove(slotItem)
                this._slotItems[slotIdx] = null
                if (dropsEgg) {
                    this._generator.populateConcrete(
                        this._slotItems, slotIdx, slotItem.drop[ObjectType.EGG]
                    )
                } else {
                    this._generator.populate(this._slotItems)
                }
            })
            if (dropsGold) {
                this._dropGold(slotIdx, slotItem.drop, slotItem.drop[ObjectType.GOLD])
            }
            if (dropsDragon) {
                if (this._owner.model.dragonsCount === 0) {
                    this.addControl(
                        UIFactory.forParent(this.type)
                            .getNavButton(this._owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80))
                    TweenLite.from(this._controls[this._controls.length-1].visual, 1, {x: -80})
                }
                const dragonData = slotItem.drop[ObjectType.DRAGON]
                this._owner.model.addDragon(dragonData.tier, dragonData.level)
                this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

                this._owner.dragonManager.addVisualDragon(dragonData.tier, dragonData.level, window.GD.getSlotRect(i))
            }
        } else if (rewardingClick && dropsGold) {

            const intermediateGold = Math.max(1, Math.floor(slotItem.drop[ObjectType.GOLD] * 0.002))
            this._dropGold(slotIdx, slotItem.drop, intermediateGold)
        }
    }
}