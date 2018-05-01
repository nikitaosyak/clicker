import {
    IClickable,
    INamedObject,
    ISlotItem,
    ISlotVisualItem,
    ITieredObject,
    ITypedObject,
    IHealthBarOwner
} from "./GameObjectBase";

export const SlotItem = (type, tier, slot) => {

    let maxHealth = 100 * tier // TODO: here should be correct calculation
    let currentHealth = maxHealth

    const self = {
        get health() { return currentHealth },
        applyClicks: damage => {
            currentHealth = Math.max(0, currentHealth-damage)
            self.setHealthBarValue(currentHealth/maxHealth)
        },
        destroy() {
            self.visual.destroy()
        }
    }

    Object.assign(self, ITypedObject(type))
    Object.assign(self, ITieredObject(tier))
    Object.assign(self, INamedObject(self))

    Object.assign(self, ISlotItem(slot))
    Object.assign(self, ISlotVisualItem(self, type))
    Object.assign(self, IHealthBarOwner(self))
    Object.assign(self, IClickable(self))

    return self
}