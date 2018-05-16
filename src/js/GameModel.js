import {AB} from "./AB";

export const MIN_STAGE = 0
export const MIN_GOLD = 0
export const MAX_DRAGON_LEVEL = 25

export const GameModel = () => {

    let connected = false
    let data = {
        currentStage: -1,
        currentGold: -1,
        currentDragons: {},
        currentSlotItems: [],
        currentStageItems: [],
        ab: -1
    }

    const initData = () => {
        data.currentStage = MIN_STAGE
        data.currentGold = MIN_GOLD
        data.currentDragons = {}
        data.currentSlotItems = []
        data.currentStageItems = []
        data.ab = AB.selectAB()
    }

    const self = {
        printCurrentState: () => {
            return JSON.stringify(data, null)
        },
        loadState: jsonData => {
            data = JSON.parse(jsonData)
            self.synchronize()
            window.location.reload(true)
        },
        connect: () => { // TODO: init connection here
            return new Promise((resolve, reject) => {
                if (connected) {
                    reject("already connected")
                }
                connected = true
                const loadData = JSON.parse(window.localStorage.dragon_clicker || null)
                if (loadData === null) {
                    initData()
                } else {
                    data = loadData
                }
                console.log('monetizing with: ', AB.strValue(data.ab))
                console.log(data)
                resolve()
            })
        },
        synchronize: () => {
            return new Promise((resolve, reject) => {
                if (!connected) {
                    reject("not connected")
                }
                window.localStorage.dragon_clicker = JSON.stringify(data)
                resolve()
            })
        },
        restart: () => {
            initData()
            self.synchronize()
            window.location.reload(true)
        },

        get stage() { return data.currentStage },
        increaseStage: () => {
            data.currentStage++
            console.log('current stage: ', data.currentStage)
            self.synchronize()
        },

        get gold() { return data.currentGold },
        addGold: (v) => {
            data.currentGold += v
            self.synchronize()
        },
        subtractGold: (v) => {
            data.currentGold -= v
            self.synchronize()
        },

        get dragonsCount () {
            let sum = 0
            Object.keys(data.currentDragons).forEach(tier => {
                data.currentDragons[tier].forEach(d => sum+=1)
            })
            return sum
        },
        get dragons() { return data.currentDragons },
        getDragons: (tier, level) => {
            return data.currentDragons[tier].filter(sh => {if (sh.level === level) return sh})
        },
        addDragon: (tier, level) => {
            if (data.currentDragons[tier]) {
                data.currentDragons[tier].push({tier: tier, level: level})
            } else {
                data.currentDragons[tier] = []
                data.currentDragons[tier].push({tier: tier, level: level})
            }
            self.synchronize()
        },
        upgradeDragon: (tier, level) => {
            if (level+1 > MAX_DRAGON_LEVEL) {
                throw `dragon upgrade failed: level ${level+1} is too big, max level is ${MAX_DRAGON_LEVEL}`
            }

            const dragonsOnTier = data.currentDragons[tier]
            for (let i = 0; i < dragonsOnTier.length; i++) {
                if (dragonsOnTier[i].level !== level) continue
                dragonsOnTier[i].level += 1
                self.synchronize()
                return
            }
            throw `dragon upgrade failed: no dragon t${tier}l${level}`
        },

        get slotItems() { return data.currentSlotItems },
        get stageItems() { return data.currentStageItems },
        updateStageItems : items => {
            data.currentStageItems = items
            self.synchronize()
        },
        updateSlotItem : (i, item) => {
            data.currentSlotItems[i] = item
            self.synchronize()
        },

        get ab() { return data.ab }
    }

    return self
}