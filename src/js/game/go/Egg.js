import {IClickable, ISlotItem, ISlotVisualItem} from "./GameObjectBase";

export const Egg = slot => {

    const self = {

    }

    Object.assign(self, ISlotItem(slot))
    Object.assign(self, ISlotVisualItem(self, 'egg'))
    Object.assign(self, IClickable(self))

    return self
}