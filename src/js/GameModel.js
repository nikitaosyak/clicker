
export const GameModel = () => {

    const MIN_STAGE = 0
    const MIN_GOLD = 0
    const MAX_DRAGON_LEVEL = 5

    let connected = false
    let currentStage = -1
    let currentGold = -1
    let currentDragons = {}
    let currentSlotItems = []
    let currentStageItems = []

    const self = {
        connect: () => { // TODO: init connection here
            return new Promise((resolve, reject) => {
                if (connected) {
                    reject("already connected")
                }
                connected = true
                currentStage = Number.parseInt(window.localStorage.clickerSavedStage) || MIN_STAGE
                currentGold = Number.parseInt(window.localStorage.clickerGold) || MIN_GOLD
                currentDragons = JSON.parse(window.localStorage.clickerDragons || '{}')
                currentSlotItems = JSON.parse(window.localStorage.clickerSlotItems || '{"items":[]}').items
                currentStageItems = JSON.parse(window.localStorage.clickerStageItems || '{"items":[]}').items
                console.log(self)
                resolve()
            })
        },
        synchronize: () => {
            return new Promise((resolve, reject) => {
                if (!connected) {
                    reject("not connected")
                }
                window.localStorage.clickerSavedStage = currentStage
                window.localStorage.clickerGold = currentGold
                window.localStorage.clickerDragons = JSON.stringify(currentDragons)
                window.localStorage.clickerSlotItems = JSON.stringify({items: currentSlotItems})
                window.localStorage.clickerStageItems = JSON.stringify({items: currentStageItems})
                resolve()
            })
        },
        restart: () => {
            currentStage = MIN_STAGE
            currentGold = MIN_GOLD
            currentDragons = {}
            currentSlotItems = []
            currentStageItems = []
            self.synchronize()
            window.location.reload(true);
        },

        get stage() { return currentStage },
        increaseStage: () => {
            currentStage++
            console.log('current stage: ', currentStage)
            self.synchronize()
        },

        get gold() { return currentGold },
        addGold: (v) => {
            currentGold += v
            self.synchronize()
        },
        subtractGold: (v) => {
            currentGold -= v
            self.synchronize()
        },

        get dragonsCount () {
            let sum = 0
            Object.keys(currentDragons).forEach(tier => {
                currentDragons[tier].forEach(d => sum+=1)
            })
            return sum
        },
        get dragons() { return currentDragons },
        addDragon: (tier, level) => {
            if (currentDragons[tier]) {
                currentDragons[tier].push({tier: tier, level: level})
            } else {
                currentDragons[tier] = []
                currentDragons[tier].push({tier: tier, level: level})
            }
            self.synchronize()
        },
        upgradeDragon: (tier, level) => {
            if (level+1 > MAX_DRAGON_LEVEL) {
                throw `dragon upgrade failed: level ${level+1} is too big, max level is ${MAX_DRAGON_LEVEL}`
            }

            const dragonsOnTier = currentDragons[tier]
            for (let i = 0; i < dragonsOnTier.length; i++) {
                if (dragonsOnTier[i].level !== level) continue
                dragonsOnTier[i].level += 1
                self.synchronize()
                return
            }
            throw `dragon upgrade failed: no dragon t${tier}l${level}`
        },

        get slotItems() { return currentSlotItems },
        get stageItems() { return currentStageItems },
        updateStageItems : items => {
            currentStageItems = items
            self.synchronize()
        },
        updateSlotItem : (i, item) => {
            currentSlotItems[i] = item
            self.synchronize()
        }
    }

    return self
}