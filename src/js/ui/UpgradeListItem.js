import {IContainer} from "../behaviours/Base";
import {UIFactory} from "./UIFactory";
import {MathUtil} from "../utils/MathUtil";
import {Slice9Stupid} from "./components/Slice9Stupid";

export const UpgradeListItem = (_, owner) => {

    let currentDragon = null
    let dragonUpgrade = null
    const self = {}
    const uiCreator = UIFactory.forParent('upgrade')
    const backdrop = Slice9Stupid('ui_sliced_backdrop', 700, 150)
    const levelWidget = uiCreator.getLevelIndicatorWidget()
    const damageWidget = uiCreator.getDamagePercentWidget()
    const upgradeBtn = uiCreator.getUpgradeButton(() => {
        owner.emit('upgrade', dragonUpgrade)
        window.soundman.play(
            'sound_sfx', 
            `upgrade${Math.random() > 0.5 ? 1 : 2}`,
             0.45 + Math.random() * 0.1
        )
    })

    self.setupWithDragons = (dragonList, totalDamage) => {
        currentDragon = dragonList[0]
        dragonUpgrade = null
        levelWidget.setLevel(currentDragon.level)
        damageWidget.damage = MathUtil.roundToDigit((dragonList.reduce((acc, current) => acc + window.GD.getSingleDragonDamage(current.tier, current.level), 0) / totalDamage) * 100, 2)
        self.visual.addChild(backdrop.visual)
        self.visual.addChild(levelWidget.visual)
        self.visual.addChild(damageWidget.visual)
        self.visual.removeChild(upgradeBtn.visual)
    }

    self.setupUpgradeButton = (price, forDragon) => {
        dragonUpgrade = forDragon
        currentDragon = null
        self.visual.removeChild(backdrop.visual)
        self.visual.removeChild(levelWidget.visual)
        self.visual.removeChild(damageWidget.visual)
        self.visual.addChild(upgradeBtn.visual)
        upgradeBtn.setPrice(price)
        upgradeBtn.setInteractive(owner.model.gold >= price)
    }

    self.updateLayout = (viewportSize, dragonManager, itemIndex) => {
        self.visual.x = 80
        self.visual.y = -itemIndex * (140)

        if (currentDragon) {
            dragonManager.setBatchLocalBounds(currentDragon.tier, currentDragon.level,
                170, viewportSize.x-300,
                owner.visual.y + self.visual.y - 20, owner.visual.y + self.visual.y + 20)
            damageWidget.visual.x = viewportSize.x - 120
            backdrop.visual.x = viewportSize.x/2 - 80
            backdrop.setSize(viewportSize.x-20, 150)
        } else {
            upgradeBtn.visual.x = viewportSize.x / 2 - self.visual.x/2 - 30
        }
        self.visual.hitArea = new PIXI.Rectangle(-70, -60, viewportSize.x - 140, 140)
        // console.log(self.visual.width, self.visual.height)
    }

    Object.assign(self, IContainer())

    return self
}