import {AB} from "../tools/AB";
import {URLParam} from "../utils/URLParam";
import {GA} from "../tools/GA";

export const MIN_STAGE = 0
export const MAX_STAGE = 42
export const MIN_GOLD = 0
export const MAX_DRAGON_LEVEL = 10
export const DEFAULT_SETTINGS = {
    music: true,
    musicVolume: 0.5,
    sfx: true,
    sfxVolume: 0.5
}

export function makeid(len = 12) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export const GameModel = () => {

    const ga = GA()
    window.GA = ga
    let connected = false
    let data = {}

    const initData = () => {
        data.userid = makeid()
        data.currentStage = MIN_STAGE
        data.currentGold = MIN_GOLD
        data.currentDragons = {}
        data.currentSlotItems = []
        data.currentStageItems = []
        data.settings = DEFAULT_SETTINGS

        if (typeof URLParam.GET('ab') !== 'undefined' && URLParam.GET('ab') !== null) {
            data.ab = Number.parseInt(URLParam.GET('ab'))
        } else {
            data.ab = AB.selectAB()
        }
    }
    initData()

    const self = {
        printCurrentState: () => {
            return LZString.compressToEncodedURIComponent(JSON.stringify(data, null))
        },
        loadState: compressedData => {
            data = JSON.parse(LZString.decompressFromEncodedURIComponent(compressedData))
            self.synchronize().then(() => {
                window.location.href = window.location.origin
            })
        },
        connect: () => { // TODO: init connection here
            return new Promise((resolve, reject) => {
                if (URLParam.GET('loadState')) {
                    connected = true
                    self.loadState(URLParam.GET('loadState'))
                    reject()
                }

                if (connected) {
                    reject("already connected")
                }
                connected = true
                const anyData = window.localStorage.dragon_clicker || null
                if (anyData === null) {
                    initData()
                } else {
                    const loadData = JSON.parse(LZString.decompressFromEncodedURIComponent(anyData))
                    data.userid = loadData.userid
                    data.currentStage = loadData.currentStage
                    data.currentGold = loadData.currentGold
                    data.currentDragons = loadData.currentDragons
                    data.currentSlotItems = loadData.currentSlotItems
                    data.currentStageItems = loadData.currentStageItems
                    data.settings = loadData.settings || DEFAULT_SETTINGS
                }
                console.log('user', data.userid, 'monetizing with: ', AB.strValue(data.ab))
                console.log(data)
                ga.startSession(data)
                resolve()
            })
        },
        synchronize: () => {
            return new Promise((resolve, reject) => {
                if (!connected) {
                    reject("not connected")
                }
                window.localStorage.dragon_clicker = self.printCurrentState()
                resolve()
            })
        },
        restart: () => {
            self.reset()
            window.location.reload(true)
        },
        reset: () => {
            initData()
            self.synchronize()
        },
        close: () => {
            self.synchronize()
            connected = false
        },

        get stage() { return data.currentStage },
        increaseStage: () => {
            data.currentStage = Math.min(data.currentStage+1, MAX_STAGE)
            self.synchronize()
            ga.accumulate('stage', 1)
        },

        get gold() { return data.currentGold },
        addGold: (v) => {
            // v *= 20
            data.currentGold += v
            self.synchronize()
            ga.diff('gold', data.currentGold)
        },
        subtractGold: (v) => {
            data.currentGold -= v
            self.synchronize()
            ga.diff('gold', data.currentGold)
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
            const newDragon = {tier: tier, level: level}
            if (data.currentDragons[tier]) {
                data.currentDragons[tier].push(newDragon)
            } else {
                data.currentDragons[tier] = []
                data.currentDragons[tier].push(newDragon)
            }
            self.synchronize()
            ga.diff('dragons', data.currentDragons)
            ga.diff('clickDamage', window.GD.getClickDamage(data.currentDragons))
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
                ga.diff('dragons', data.currentDragons)
                ga.diff('clickDamage', window.GD.getClickDamage(data.currentDragons))
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

        get ab() { return data.ab },

        get settings() { return data.settings },
        updateSettings : (v) => {
            data.settings = v
            self.synchronize()
        }
    }

    return self
}