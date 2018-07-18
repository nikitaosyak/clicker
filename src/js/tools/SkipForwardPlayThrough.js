

export const SkipForwardPlayThrough = (model, data, stage) => {
    for (let i = 0; i < stage; i++) {
        const chests = data.generateStageItems(i)
        chests.forEach(chest => {
            if (chest.drops.egg) {
                const dr = chest.drops.egg.drops.dragon
                model.addDragon(dr.tier, 1)
            }

            if (chest.drops.gold) {
                model.addGold(chest.drops.gold)
            }
        })

        model.increaseStage()
    }

    const currentChests = data.generateStageItems(stage)
    const slotChests = [null, null, null]
    for (let i = 0; i < 3; i++) {
        currentChests.forEach((ch, chIdx) => {
            if (ch.slot !== i) return
            if (slotChests[i] !== null) return
            slotChests[i] = currentChests.splice(chIdx, 1)[0]
        })
        model.updateSlotItem(i, slotChests[i])
    }

    model.updateStageItems(currentChests)
}