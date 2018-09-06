import {AB} from "../tools/AB";
import {URLParam} from "../utils/URLParam";
import {GA} from "../tools/GA";
import {Platform} from "../platform/Platform";

export const MIN_STAGE = 0
export const MAX_STAGE = 42
export const MIN_GOLD = 0
export const MAX_DRAGON_LEVEL = 10

const DEFAULT_SETTINGS = {
    music: true,
    musicVolume: 0.5,
    sfx: true,
    sfxVolume: 0.5
}

export const GameModel = () => {

    const ga = window.GA = GA()
    const platform = window.platform = Platform()

    let connected = false
    let data = {}
    let settings = null

    const initData = () => {
        data.currentStage = MIN_STAGE
        data.currentGold = MIN_GOLD
        data.currentDragons = {}
        data.currentSlotItems = []
        data.currentStageItems = []
        data.restarts = 0

        settings = settings || DEFAULT_SETTINGS

        if (typeof URLParam.GET('ab') !== 'undefined' && URLParam.GET('ab') !== null) {
            data.ab = Number.parseInt(URLParam.GET('ab'))
        } else {
            data.ab = AB.selectAB()
        }
    }

    const synchronize = () => {
        return new Promise((resolve, reject) => {
                if (!connected) {
                reject("not connected")
            }
            window.localStorage.dragon_clicker = self.printCurrentState()
            window.localStorage.dragon_clicker_local_settings = JSON.stringify(settings)
            resolve()
        })
    }
    initData()

    const self = {
        printCurrentState: () => {
            return LZString.compressToEncodedURIComponent(JSON.stringify(data, null))
        },
        loadState: compressedData => {
            data = JSON.parse(LZString.decompressFromEncodedURIComponent(compressedData))
            synchronize().then(() => {
                window.location.href = window.location.origin
            })
        },
        connect: () => {
            return new Promise((resolve, reject) => {
                platform.init().then(() => {
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
                    const anySettings = window.localStorage.dragon_clicker_local_settings || null
                    settings = anySettings ? JSON.parse(anySettings) : DEFAULT_SETTINGS
                    if (anyData === null) {
                        initData()
                    } else {
                        const loadData = JSON.parse(LZString.decompressFromEncodedURIComponent(anyData))
                        data.currentStage = loadData.currentStage
                        data.currentGold = loadData.currentGold
                        data.currentDragons = loadData.currentDragons
                        data.currentSlotItems = loadData.currentSlotItems
                        data.currentStageItems = loadData.currentStageItems
                        data.restarts = loadData.restarts || 0 // older versions compatibility
                    }
                    console.log('user', platform.getUserId(), 'monetizing with: ', AB.strValue(data.ab))
                    console.log(data)
                    ga.startSession(data)
                    resolve()
                }).catch(reject)
            })
        },
        restart: () => {
            const restarts = data.restarts
            self.reset()
            data.restarts = restarts + 1
            synchronize().then(() => {
                window.location.reload(true)
            })
        },
        reset: () => {
            initData()
            synchronize()
        },
        close: () => {
            synchronize()
            connected = false
        },

        get stage() { return data.currentStage },
        increaseStage: () => {
            data.currentStage = Math.min(data.currentStage+1, MAX_STAGE)
            synchronize()
            ga.accumulate('stage', 1)
        },

        get gold() { return data.currentGold },
        addGold: (v) => {
            // v *= 20
            data.currentGold += v
            synchronize()
            ga.diff('gold', data.currentGold)
        },
        subtractGold: (v) => {
            data.currentGold -= v
            synchronize()
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
            synchronize()
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
                synchronize()
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
            synchronize()
        },
        updateSlotItem : (i, item) => {
            data.currentSlotItems[i] = item
            synchronize()
        },

        get ab() { return data.ab },

        get settings() { return settings },
        updateSettings : (v) => {
            settings = v
            synchronize()
        }
    }

    return self
}