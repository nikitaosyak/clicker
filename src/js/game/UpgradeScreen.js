import {BaseScreen} from "./screen/BaseScreen";
import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";
import {GoldCounter} from "./ui/GoldCounter";
import {UpgradeList} from "./screen/upgrade/UpgradeList";

export class UpgradeScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.UPGRADE)

        this._list = UpgradeList(owner.model, owner.renderer)
        this.add(this._list)

        const uiCreator = UIFactory.forParent(this.type)
        // const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(
            owner, SCREEN_TYPE.GAME,
            'ui_right_arrow', {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 40}))

        this._goldCounter = GoldCounter({x: 'center', y: 'bottom', yOffset: 60}, this._owner.model.gold)
        this.add(this._goldCounter)

        this._list.on('upgrade', dragon => {
            owner.model.subtractGold(window.GD.getUpgradePrice(dragon.tier, dragon.level))
            this._goldCounter.setValue(owner.model.gold)

            const visualDragons = this._owner.dragonManager.getVisualDragons(dragon.tier, dragon.level)
            visualDragons[0].levelUp()
            owner.model.upgradeDragon(dragon.tier, dragon.level)

            this._list.invalidate(this._owner.model.dragons)
            this._list.updateDragonsLayout(this._cachedViewportSize, this._owner.dragonManager)
        })
    }

    onViewportSizeChanged() {
        this._list.updateBounds(this._cachedViewportSize, this._owner.dragonManager)
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)
        this._list.invalidate(this._owner.model.dragons)
        this._list.updateBounds(this._cachedViewportSize, this._owner.dragonManager)
        this._list.scrollToTop()
    }
}