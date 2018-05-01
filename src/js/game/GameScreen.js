import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./screen/game/SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        const uiCreator = UIFactory.forScreen(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80, 90, 90))
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.LEADERBOARD, 'ui_leaderboard', 720, 180, 90, 90))

        this._generator = SlotItemGenerator(this, owner.model)
        this._slotItems = [null, null, null]
        this._generator.populate(this._slotItems)
    }

    update(dt) {
        this._slotItems.forEach((c, i) => {
            const clicks = c.extractClicks()
            if (clicks > 0) {
                console.log('will damage for ', (20 * Math.pow(2, this._owner.model.stage)))
                c.applyDamage(clicks * (20 * Math.pow(2, this._owner.model.stage)))
                if (c.health <= 0) {
                    this.remove(this._slotItems[i])
                    const egg = this._slotItems[i].dropEgg()
                    this._slotItems[i].destroy()
                    if (egg) {
                        this._slotItems[i] = egg
                        this.add(egg)
                    } else {
                        this._slotItems[i] = null
                        this._generator.populate(this._slotItems)
                    }
                }
            }
        })
    }
}