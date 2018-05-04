import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./screen/game/SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";
import {GoldCounter} from "./ui/GoldCounter";
import {ObjectType} from "./go/GameObjectBase";
import {CoinParticlesManager} from "./screen/game/CoinParticlesManager";
import {Dragon} from "./go/Dragon";

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
            this.addControl(uiCreator.getButton('ui_restart', 80, 180, this._owner.model.restart))
        }

        this._goldCounter = GoldCounter(740, 800, this._owner.model.gold)
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
                self._renderer.addDragon(Dragon(
                    this._renderer,
                    dragonData.tier,
                    dragonData.level,
                    100 + Math.round(Math.random()*500), 100 + Math.round(Math.random()*500)))
            })
        })

        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)
    }

    _setBoundsForDragon(dragonVisual) {dragonVisual.setBounds(50, 750, 50, 750)}

    _dropGold(i, dropData, value) {
        const self = this
        dropData[ObjectType.GOLD] -= value
        self._owner.model.addGold(value)
        self._particles.dropCoin(i, value)
        self._goldCounter.setValue(this._owner.model.gold)
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)
        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

        this._owner.renderer.dragons.forEach(sh => this._setBoundsForDragon(sh))
    }

    update(dt) {
        this._particles.update(dt)
        this._slotItems.forEach((c, i) => {
            if (c === null) return
            const clicks = c.extractClicks()
            if (clicks > 0) {
                console.log('will damage for ', this._clickDamage)
                const rewardingClick = c.processDamage(clicks * this._clickDamage)

                const drop = this._slotItems[i].drop
                const dropsGold = typeof drop[ObjectType.GOLD] !== "undefined"
                const dropsDragon = typeof drop[ObjectType.DRAGON] !== "undefined"
                const dropsEgg = typeof drop[ObjectType.EGG] !== "undefined"
                if (c.health <= 0) {
                    this.remove(this._slotItems[i])
                    this._slotItems[i].clear().then(() => {
                        this._slotItems[i] = null
                        if (dropsEgg) {
                            this._generator.populateConcrete(
                                this._slotItems, i, drop[ObjectType.EGG]
                            )
                        } else {
                            this._generator.populate(this._slotItems)
                        }
                    })
                    if (dropsGold) {
                        this._dropGold(i, drop, drop[ObjectType.GOLD])
                    }
                    if (dropsDragon) {
                        if (this._owner.model.dragonsCount === 0) {
                            this.addControl(
                                UIFactory.forParent(this.type)
                                .getNavButton(this._owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80))
                            TweenLite.from(this._controls[this._controls.length-1].visual, 1, {x: -80})
                        }
                        const dragonData = drop[ObjectType.DRAGON]
                        const slot = window.GD.getSlotRect(i)
                        this._owner.model.addDragon(dragonData.tier, dragonData.level)
                        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

                        const dragon = Dragon(
                            this._renderer,
                            dragonData.tier,
                            dragonData.level,
                            slot.x, slot.y)
                        this._setBoundsForDragon(dragon)
                        this._renderer.addDragon(dragon)
                    }
                } else if (rewardingClick && dropsGold) {

                    const intermediateGold = Math.max(1, Math.floor(drop[ObjectType.GOLD] * 0.002))
                    this._dropGold(i, drop, intermediateGold)
                }
            }
        })
    }
}