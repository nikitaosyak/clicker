import {
    IClickable,
    INamedObject,
    ISlotItem,
    ISlotVisualItem,
    IStageObject,
    ITypedObject,
    IVisualNumericRep
} from "./GameObjectBase";

export const PaidSlotItem = (type, slot, stage, drop, targetSlot) => {

    let wasPaid = false

    const self = {
        get drop() { return drop },
        get health() { return wasPaid ? -1 : 1 },
        get targetSlot() { return targetSlot },
        processDamage: () => {
            if (window.confirm('посмотреть рекламу?')) {
                wasPaid = true
            }
        },
        clear() {
            return new Promise((resolve, reject) => {
                if (window.GD.config.MODE === 'development') {
                    self.stageRepVisual.destroy()
                    self.targetSlotRepVisual.destroy()
                }
                self.visual.destroy()
                resolve()
            })
        }
    }

    Object.assign(self, ITypedObject(type))
    Object.assign(self, IStageObject(stage))
    Object.assign(self, INamedObject(self))

    Object.assign(self, ISlotItem(slot))
    Object.assign(self, ISlotVisualItem(self, type))
    if (window.GD.config.MODE === 'development') {
        Object.assign(self, IVisualNumericRep(self, 'stage', -0.3, 0.25, 0xCCCC00))
        Object.assign(self, IVisualNumericRep(self, 'targetSlot', 0.3, 0.25, 0xAA0000))
    }
    Object.assign(self, IClickable(self))

    return self
}