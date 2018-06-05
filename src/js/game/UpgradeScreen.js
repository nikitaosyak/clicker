import {BaseScreen} from "./screen/BaseScreen";
import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {GoldCounter} from "./ui/GoldCounter";
import {UpgradeList} from "./screen/upgrade/UpgradeList";

export class UpgradeScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.UPGRADE)

        const uiCreator = UIFactory.forParent(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.GAME, 'ui_right_arrow', 720, 80))

        this._goldCounter = GoldCounter(740, 1230, this._owner.model.gold)
        this.add(this._goldCounter)

        this._list = UpgradeList(owner.model, 0, 1100)
        this.add(this._list)

        const invalidateUpgrade = () => {
            const flatList =  this._list.invalidate(this._owner.model.dragons)
            flatList.forEach((fl, i) => {
                const middle = 1100 - i * 120
                this._owner.dragonManager.updateSpecificBounds(fl[0].tier, fl[0].level, 150, 650, middle-40, middle+40)
            })
        }

        this._list.on('upgrade', dragon => {
            owner.model.subtractGold(window.GD.getUpgradePrice(dragon.tier, dragon.level))
            this._goldCounter.setValue(owner.model.gold)


            // console.log(this._owner.renderer.getDragons(dragon.tier, dragon.level))
            const visualDragons = this._owner.dragonManager.getVisualDragons(dragon.tier, dragon.level)
            visualDragons[0].levelUp()
            owner.model.upgradeDragon(dragon.tier, dragon.level)

            invalidateUpgrade.call(this)
        })

        this._list.on('upgrade-all', dragon => {
            const baseTier = dragon.tier
            const baseLevel = dragon.level
            const dragons = owner.model.getDragons(baseTier, baseLevel)
            const visualDragons = this._owner.dragonManager.getVisualDragons(baseTier, baseLevel)
            owner.model.subtractGold(window.GD.getUpgradePrice(baseTier, baseLevel) * dragons.length)
            this._goldCounter.setValue(owner.model.gold)

            dragons.forEach(d => owner.model.upgradeDragon(baseTier, baseLevel))
            visualDragons.forEach(vd => vd.levelUp())

            invalidateUpgrade.call(this)
        })
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)

        const flatList = this._list.invalidate(this._owner.model.dragons)
        flatList.forEach((fl, i) => {
            const middle = 1100 - i * 120
            this._owner.dragonManager.updateSpecificBounds(fl[0].tier, fl[0].level, 150, 650, middle-40, middle+40)
        })
    }
}