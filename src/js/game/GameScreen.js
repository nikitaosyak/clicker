import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./screen/game/SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";
import {GoldCounter} from "./ui/GoldCounter";
import {ObjectType} from "./go/GameObjectBase";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        const uiCreator = UIFactory.forParent(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80))
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.LEADERBOARD, 'ui_leaderboard', 720, 180))

        this.add(GoldCounter(740, 800))

        this.add(uiCreator.getCoinSpec(400, 400))

        this._generator = SlotItemGenerator(this, owner.model)
        this._slotItems = [null, null, null]
        this._generator.populate(this._slotItems)
    }

    update(dt) {
        this._slotItems.forEach((c, i) => {
            const clicks = c.extractClicks()
            if (clicks > 0) {
                console.log('will damage for ', (20 * Math.pow(2, this._owner.model.stage)))
                c.applyDamage(clicks * (20 * Math.pow(2, this._owner.model.stage))) // TODO: fix damage

                if (c.health <= 0) {
                    this.remove(this._slotItems[i])
                    const drop = this._slotItems[i].getDrop()
                    this._slotItems[i].clear().then(() => {
                        this._slotItems[i] = null
                        if (typeof drop[ObjectType.EGG] !== "undefined") {
                            this._generator.populateConcrete(
                                this._slotItems, i,
                                ObjectType.EGG, drop[ObjectType.EGG]
                            )
                        } else {
                            this._generator.populate(this._slotItems)
                        }
                    })
                    if (typeof drop[ObjectType.GOLD] !== "undefined") {
                        console.log('DROPPED', drop[ObjectType.GOLD], 'gold')
                    }
                    if (typeof drop[ObjectType.DRAGON] !== "undefined") {
                        console.log('DROPPED DRAGON: ', drop[ObjectType.DRAGON])
                    }
                }
            }
        })
    }
}