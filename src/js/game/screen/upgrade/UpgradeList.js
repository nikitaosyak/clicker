import {ObjectPool} from "../../../utils/ObjectPool";
import {UpgradeListItem} from "./UpgradeListItem";
import {IContainer} from "../../go/GameObjectBase";
import {INamedUIElement} from "../../ui/UIElementBase";
import {EmitterBehaviour} from "../../../utils/EmitterBehaviour";

export const UpgradeList = (model, x, y) => {

    const self = {
        get model() { return model }
    }
    const pool = ObjectPool(UpgradeListItem, [self], 10)
    let current = []

    self.invalidate = dragons => {
        current.forEach(el => {
            self.visual.removeChild(el.visual)
            pool.putOne(el)
        })

        const flatList = []
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
                    flatList.push([])
                    listIndex+=1
                    currentLevel = dragon.level
                }
                flatList[listIndex].push(dragon)
            }
        })

        let vOffset = 0
        current = flatList.map(sortedDragons => {
            const listItem = pool.getOne()
            listItem.setup(sortedDragons[0])
            listItem.visual.x = 0
            listItem.visual.y = vOffset * -120
            vOffset += 1

            self.visual.addChild(listItem.visual)
            return listItem
        })

        current.forEach(el => {
            self.visual.addChild(el.visual)
        })

        return flatList
    }

    Object.assign(self, INamedUIElement('upgrade', 'list'))
    Object.assign(self, IContainer(x, y))
    Object.assign(self, EmitterBehaviour({}))
    return self
}