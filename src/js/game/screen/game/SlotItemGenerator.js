import {SlotItem} from "../../go/SlotItem";

export const SlotItemGenerator = (owner, model, savedStageItems) => {

    let gameData = window.GD
    let currentStageItems = savedStageItems.length > 0 ? savedStageItems : gameData.generateStageItems(model.stage)

    const self = {
        populateConcrete: (slots, slotIdx, data) => {
            console.log(`populating slot ${slotIdx} with ${data.type}:`, data)
            model.updateSlotItem(slotIdx, data)
            const item = SlotItem(data.type, slotIdx, data.stage, data.health, data.drops)
            owner.add(item)
            slots[slotIdx] = item
        },
        populate: slots => {
            for (let i = 0; i < slots.length; i++) {
                if (slots[i] === null) {
                    if (currentStageItems.length === 0) {
                        model.increaseStage()
                        currentStageItems = gameData.generateStageItems(model.stage)
                    }
                    self.populateConcrete(slots, i,
                        currentStageItems.splice(0, 1)[0])

                    model.updateStageItems(currentStageItems)
                }
            }
        }
    }
    return self
}