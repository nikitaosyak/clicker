import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {SlotItemGenerator} from "./SlotItemGenerator";
import {BaseScreen} from "./screen/BaseScreen";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        const uiCreator = UIFactory.forScreen(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.UPGRADE, 'ui_upgrade', 80, 80, 90, 90))
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.LEADERBOARD, 'ui_leaderboard', 720, 180, 90, 90))

        this._generator = SlotItemGenerator(this)
        this._slotItems = [null, null, null]
        this._generator.populate(this._slotItems)
    }

    update(dt) {
        this._slotItems.forEach((c, i) => {
            const clicks = c.extractClicks()
            if (clicks > 0) {
                console.log(`extracted ${clicks} clicks from ${c.name}`)
                c.applyClicks(clicks * 10)
                if (c.health <= 0) {
                    this.remove(this._slotItems[i])
                    this._slotItems[i].destroy()
                    this._generator.populate(this._slotItems)
                }
            }
        })
    }
}