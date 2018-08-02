import {SlotItem} from "./SlotItem";
import {ObjectType} from "../behaviours/Base";
import {PaidSlotItem} from "./PaidSlotItem";

export const SlotItemGenerator = (owner, model, savedStageItems) => {

    let gameData = window.GD
    let currentStageItems = savedStageItems.length > 0 ? savedStageItems : gameData.generateStageItems(model.stage)
    let typeConstructor = {
        [ObjectType.EGG] : SlotItem,
        [ObjectType.CHEST] : SlotItem,
        [ObjectType.PAID_EGG] : PaidSlotItem,
        [ObjectType.PAID_CHEST] : PaidSlotItem,
    }

    const getChestForSlot = slotIdx => {
        for (let i = 0; i < currentStageItems.length; i++) {
            if (currentStageItems[i].slot !== slotIdx) continue
            return currentStageItems.splice(i, 1)[0]
        }

        //
        // lazy update game model here
        model.increaseStage()
        currentStageItems = currentStageItems.concat(gameData.generateStageItems(model.stage))
        model.updateStageItems(currentStageItems)
        return getChestForSlot(slotIdx)
    }

    const self = {
        populateConcrete: (slots, slotIdx, data) => {
            // console.log(`populating slot ${slotIdx} with ${data.type}:`, data)
            model.updateSlotItem(slotIdx, data)
            let item = new typeConstructor[data.type](data.type, slotIdx, data.stage, data.health, data.drops, data.slot, owner)
            owner.add(item)
            slots[slotIdx] = item
        },
        populateAtGameStart: slots => {
            const firstChest = getChestForSlot(2)
            firstChest.health = window.GD.baseDamage * 10
            firstChest.drops.egg.health = window.GD.baseDamage * 5
            self.populateConcrete(slots, 1, firstChest)
        },
        populate: slots => {
            for (let i = 0; i < slots.length; i++) {
                if (slots[i] === null) {
                    self.populateConcrete(slots, i, getChestForSlot(i))
                    model.updateStageItems(currentStageItems)
                }
            }
        }
    }
    return self
}