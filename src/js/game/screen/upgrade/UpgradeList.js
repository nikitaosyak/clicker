import {ObjectPool} from "../../../utils/ObjectPool";
import {UpgradeListItem} from "./UpgradeListItem";
import {IContainer} from "../../go/GameObjectBase";
import {INamedUIElement} from "../../ui/UIElementBase";
import {EmitterBehaviour} from "../../../utils/EmitterBehaviour";
import {IAdoptableBase} from "../../stretching/AdoptableBase";
import {RENDER_LAYER} from "../../../Renderer";

export const UpgradeList = (model) => {

    const self = {
        get model() { return model }
    }
    const pool = ObjectPool(UpgradeListItem, [self], 10)
    let children = []
    let groupedByLevel = []

    self.updateBounds = (viewportSize, dragonMan) => {
        console.log(viewportSize, self.visual.height)
        children.forEach((listItem, i) => {
            listItem.updateLayout(viewportSize, dragonMan, i)
        })
    }

    self.invalidate = (dragons) => {
        children.forEach(el => {
            self.visual.removeChild(el.visual)
            pool.putOne(el)
        })
        children = []

        groupedByLevel = []
        let listIndex = -1
        Object.keys(dragons).forEach(tier => {
            dragons[tier].sort((a, b) => {
                if (a.level < b.level) return -1
                if (a.level > b.level) return 1
                return 0
            })
            let currentLevel = 0
            for (let i = 0; i < dragons[tier].length; i++) {
                const dragon = dragons[tier][i]
                if (dragon.level > currentLevel) {
                    groupedByLevel.push([])
                    listIndex+=1
                    currentLevel = dragon.level
                }
                groupedByLevel[listIndex].push(dragon)
            }
        })

        let currentTier = 0
        for (let i = 0; i < groupedByLevel.length; i++) {
            const dragonsOfLevel = groupedByLevel[i]
            const addDragonItem = () => {
                const listItem = pool.getOne()
                listItem.setupWithDragons(dragonsOfLevel)
                self.visual.addChild(listItem.visual)
                children.push(listItem)
            }

            if (currentTier === dragonsOfLevel[0].tier) {
                addDragonItem()
            } else {
                currentTier += 1
                const listItem = pool.getOne()
                listItem.setupUpgradeButton(window.GD.getUpgradePrice(dragonsOfLevel[0].tier, dragonsOfLevel[0].level), dragonsOfLevel[0])
                self.visual.addChild(listItem.visual)
                children.push(listItem)
                addDragonItem()
            }
        }

        children.forEach(el => self.visual.addChild(el.visual))
    }

    Object.assign(self, INamedUIElement('upgrade', 'list'))
    Object.assign(self, IContainer(0, 0, RENDER_LAYER.UI))
    Object.assign(self, IAdoptableBase(self.visual, {x: 'left', xOffset: 0, y: 'bottom', yOffset: 170}))
    Object.assign(self, EmitterBehaviour({}))
    return self
}