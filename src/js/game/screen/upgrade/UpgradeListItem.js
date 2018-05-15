import {IContainer} from "../../go/GameObjectBase";
import {UIFactory} from "../../ui/UIFactory";
import {MAX_DRAGON_LEVEL} from "../../../GameModel";
import {MathUtil} from "../../../utils/MathUtil";

export const UpgradeListItem = (owner) => {

    let currentDragon = null
    const self = {}
    const uiCreator = UIFactory.forParent('upgrade')
    const infoWidget = uiCreator.getUpgradeInfoWidget(80, 0)
    const upgradeButton = uiCreator.getButton('ui_upgrade_dragon', 720, 0, () => {
        owner.emit('upgrade', currentDragon)
    }, 100, 100)
    const upgradeAllButton = uiCreator.getButton('ui_upgrade_all_dragons', 600, 0, () => {
        owner.emit('upgrade-all', currentDragon)
    }, 100, 100)

    self.setup = (referenceDragon, dragonsOnLevel) => {
        currentDragon = referenceDragon
        infoWidget.tier = referenceDragon.tier
        infoWidget.level = referenceDragon.level
        infoWidget.damage = window.GD.getSingleDragonDamage(
            referenceDragon.tier, referenceDragon.level)

        if (referenceDragon.level >= MAX_DRAGON_LEVEL) {
            infoWidget.price = ''

            upgradeButton.visual.visible = false
            upgradeAllButton.visual.visible = false
        } else {
            let price = window.GD.getUpgradePrice(referenceDragon.tier, referenceDragon.level)
            infoWidget.price = MathUtil.convert(price)

            upgradeButton.visual.visible = true

            if (owner.model.gold >= price) {
                upgradeButton.visual.tint = 0xFFFFFF
                upgradeButton.visual.interactive = true
            } else {
                upgradeButton.visual.tint = 0xAAAAAA
                upgradeButton.visual.interactive = false
            }

            if (dragonsOnLevel > 1) {
                upgradeAllButton.visual.visible = true
                price = price * dragonsOnLevel

                if (owner.model.gold >= price) {
                    upgradeAllButton.visual.tint = 0xFFFFFF
                    upgradeAllButton.visual.interactive = true
                } else {
                    upgradeAllButton.visual.visible = false
                }
            } else {
                upgradeAllButton.visual.visible = false
            }
        }

    }
    Object.assign(self, IContainer(0, 0))
    self.visual.addChild(infoWidget.visual)
    self.visual.addChild(upgradeButton.visual)
    self.visual.addChild(upgradeAllButton.visual)

    return self
}