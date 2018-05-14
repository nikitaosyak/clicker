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
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.GAME, 'ui_right_arrow', 720, 180))

        this._goldCounter = GoldCounter(740, 1230, this._owner.model.gold)
        this.add(this._goldCounter)

        this._list = UpgradeList(owner.model, 0, 1100)
        this.add(this._list)

        this._list.on('upgrade', dragon => {
            owner.model.subtractGold(window.GD.getUpgradePrice(dragon.tier, dragon.level))
            this._goldCounter.setValue(owner.model.gold)


            // console.log(this._owner.renderer.getDragons(dragon.tier, dragon.level))
            const visualDragons = this._owner.renderer.getDragons(dragon.tier, dragon.level)
            visualDragons[0].levelUp()
            owner.model.upgradeDragon(dragon.tier, dragon.level)

            const flatList =  this._list.invalidate(this._owner.model.dragons)
            flatList.forEach((fl, i) => {
                const dragons = this._owner.renderer.getDragons(fl[0].tier, fl[0].level)
                dragons.forEach(d => {
                    const middle = 1100 - i * 120
                    d.setBounds(150, 650, middle-40, middle+40)
                })
            })
        })
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)

        const flatList = this._list.invalidate(this._owner.model.dragons)
        flatList.forEach((fl, i) => {
            const dragons = this._owner.renderer.getDragons(fl[0].tier, fl[0].level)
            dragons.forEach(d => {
                const middle = 1100 - i * 120
                d.setBounds(150, 650, middle-40, middle+40)
            })
        })
    }
}