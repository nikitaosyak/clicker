import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./screen/game/SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";
import {GoldCounter} from "./ui/GoldCounter";
import {ObjectType} from "./go/GameObjectBase";
import {CoinParticlesManager} from "./screen/game/CoinParticlesManager";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        const uiCreator = UIFactory.forParent(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80))
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.LEADERBOARD, 'ui_leaderboard', 720, 180))

        this._goldCounter = GoldCounter(740, 800, this._owner.model.gold)
        this.add(this._goldCounter)

        this._particles = CoinParticlesManager(this._goldCounter.visual)
        this.add(this._particles)

        this._generator = SlotItemGenerator(this, owner.model)
        this._slotItems = [null, null, null]
        this._generator.populate(this._slotItems)
    }

    _dropGold(i, dropData, value) {
        const self = this
        dropData[ObjectType.GOLD] -= value
        self._owner.model.addGold(value)
        self._particles.dropCoin(i, value)
        self._goldCounter.setValue(this._owner.model.gold)
    }

    update(dt) {
        this._particles.update(dt)
        this._slotItems.forEach((c, i) => {
            const clicks = c.extractClicks()
            if (clicks > 0) {
                console.log('will damage for ', (20 * Math.pow(2, this._owner.model.stage)))
                const rewardingClick = c.processDamage(clicks * (20 * Math.pow(2, this._owner.model.stage))) // TODO: fix damage

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
                                this._slotItems, i,
                                ObjectType.EGG, drop[ObjectType.EGG]
                            )
                        } else {
                            this._generator.populate(this._slotItems)
                        }
                    })
                    if (dropsGold) {
                        this._dropGold(i, drop, drop[ObjectType.GOLD])
                    }
                    if (dropsDragon) {
                        console.log('DROPPED DRAGON: ', drop[ObjectType.DRAGON])
                    }
                } else if (rewardingClick && dropsGold) {
                    const intermediateGold = Math.max(1, Math.floor(drop[ObjectType.GOLD] * 0.002))
                    this._dropGold(i, drop, intermediateGold)
                }
            }
        })
    }
}