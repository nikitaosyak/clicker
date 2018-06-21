import {IContainer} from "../../go/GameObjectBase";
import {UIFactory} from "../../ui/UIFactory";
import {MathUtil} from "../../../utils/MathUtil";

export const UpgradeListItem = (_, owner) => {

    let currentDragon = null
    let dragonUpgrade = null
    const self = {}
    const uiCreator = UIFactory.forParent('upgrade')
    const levelWidget = uiCreator.getLevelIndicatorWidget()
    const damageWidget = uiCreator.getDamagePercentWidget()
    const upgradeBtn = uiCreator.getUpgradeButton(() => {
        owner.emit('upgrade', dragonUpgrade)
    })

    self.setupWithDragons = (dragonList, totalDamage) => {
        currentDragon = dragonList[0]
        dragonUpgrade = null
        levelWidget.setLevel(currentDragon.level)
        damageWidget.damage = MathUtil.roundToDigit((dragonList.reduce((acc, current) => acc + window.GD.getSingleDragonDamage(current.tier, current.level), 0) / totalDamage) * 100, 2)
        self.visual.addChild(levelWidget.visual)
        self.visual.addChild(damageWidget.visual)
        self.visual.removeChild(upgradeBtn.visual)
    }

    self.setupUpgradeButton = (price, forDragon) => {
        dragonUpgrade = forDragon
        currentDragon = null
        self.visual.removeChild(levelWidget.visual)
        self.visual.removeChild(damageWidget.visual)
        self.visual.addChild(upgradeBtn.visual)
        upgradeBtn.setPrice(price)

        if (owner.model.gold >= price) {
            upgradeBtn.visual.tint = 0xFFFFFF
            upgradeBtn.visual.interactive = true
        } else {
            upgradeBtn.visual.tint = 0xAAAAAA
            upgradeBtn.visual.interactive = false
        }
    }

    self.updateLayout = (viewportSize, dragonManager, itemIndex) => {
        self.visual.x = 80
        self.visual.y = -itemIndex * (120)

        if (currentDragon) {
            dragonManager.setBatchLocalBounds(currentDragon.tier, currentDragon.level,
                170, viewportSize.x-300,
                owner.visual.y + self.visual.y - 20, owner.visual.y + self.visual.y + 20)
            damageWidget.visual.x = viewportSize.x - 270
        } else {
            upgradeBtn.visual.x = viewportSize.x / 2 - self.visual.x/2 - 30
        }
        self.visual.hitArea = new PIXI.Rectangle(-80, -60, viewportSize.x, 120)
        // console.log(self.visual.width, self.visual.height)
    }

    Object.assign(self, IContainer(0, 0))

    return self
}