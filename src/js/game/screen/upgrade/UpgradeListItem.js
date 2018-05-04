import {IContainer} from "../../go/GameObjectBase";
import {UIFactory} from "../../ui/UIFactory";
import {MAX_DRAGON_LEVEL} from "../../../GameModel";

export const UpgradeListItem = (owner) => {

    let currentDragon = null
    const self = {}
    const uiCreator = UIFactory.forParent('upgrade')
    const infoWidget = uiCreator.getUpgradeInfoWidget(80, 0)
    const upgradeButton = uiCreator.getButton('ui_upgrade_dragon', 720, 0, () => {
        owner.emit('upgrade', currentDragon)
    }, 100, 100)

    self.setup = referenceDragon => {
        currentDragon = referenceDragon
        infoWidget.tier = referenceDragon.tier
        infoWidget.level = referenceDragon.level
        infoWidget.damage = window.GD.getSingleDragonDamage(
            referenceDragon.tier, referenceDragon.level)

        if (referenceDragon.level >= MAX_DRAGON_LEVEL) {
            infoWidget.price = ''

            upgradeButton.visual.alpha = 0
        } else {
            const price = window.GD.getUpgradePrice(referenceDragon.tier, referenceDragon.level)
            infoWidget.price = price

            upgradeButton.visual.alpha = 1

            if (owner.model.gold >= price) {
                upgradeButton.visual.tint = 0xFFFFFF
                upgradeButton.visual.interactive = true
            } else {
                upgradeButton.visual.tint = 0xCCCCCC
                upgradeButton.visual.interactive = false
            }
        }

    }
    Object.assign(self, IContainer(0, 0))
    self.visual.addChild(infoWidget.visual)
    self.visual.addChild(upgradeButton.visual)

    return self
}