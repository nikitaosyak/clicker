import {
    IClickable,
    INamedObject,
    ISlotItem,
    ISlotVisualItem,
    IStageObject,
    ITypedObject,
    IHealthBarOwner, IVisualStageRepresentationOwner, ObjectType as OBJECT_TYPE
} from "./GameObjectBase";

export const SlotItem = (type, slot, stage, health, egg = undefined) => {

    let maxHealth = health
    let currentHealth = maxHealth

    const self = {
        get health() { return currentHealth },
        applyDamage: value => {
            currentHealth = Math.max(0, currentHealth-value)
            self.setHealthBarValue(currentHealth/maxHealth)
        },
        destroy() {
            self.healthbarVisual.destroy()
            if (window.ENV.MODE === 'development') {
                self.stageRepVisual.destroy()
            }
            self.visual.destroy()
        },
        dropEgg() {
            if (self.type === OBJECT_TYPE.EGG) return null
            if (typeof egg === "undefined") return null
            return SlotItem(OBJECT_TYPE.EGG, slot, egg, health)
        }
    }

    Object.assign(self, ITypedObject(type))
    Object.assign(self, IStageObject(stage))
    Object.assign(self, INamedObject(self))

    Object.assign(self, ISlotItem(slot))
    Object.assign(self, ISlotVisualItem(self, type))
    Object.assign(self, IHealthBarOwner(self))
    if (window.ENV.MODE === 'development') {
        Object.assign(self, IVisualStageRepresentationOwner(self))
    }
    Object.assign(self, IClickable(self))

    return self
}