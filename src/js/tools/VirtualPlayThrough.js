import {ObjectType} from "../game/go/GameObjectBase";
import {MathUtil} from "../utils/MathUtil";

export const VirtualPlayThrough = (gameData, strategy, maxStage, substages, cps, verbose = false) => {

    let allDragons = []

    let savedGold = 0
    const getMaxTier = (dragons) => {
        return dragons.reduce((acc, item) => { return  item.tier > acc ? item.tier : acc }, 0)
    }
    const getSortedDragonsOfTier = (dragons, tier) => {
        let dragonsOfTier = dragons.filter(d => d.tier === tier)
        dragonsOfTier.sort((a, b) => {
            if (a.level < b.level) return -1
            if (a.level > b.level) return 1
            return 0
        })
        return dragonsOfTier
    }
    const upgradeConcreteDragon = (dragons, tier, level) => {
        for (let i = 0; i < dragons.length; i++) {
            const dragon = dragons[i]
            if (dragon.tier === tier && dragon.level === level) {
                dragon.level += 1
                return
            }
        }
    }
    const maxTierMinLevelStratUpgrade = (dragons, gold) => {
        const tryUpgradeOnTier = (tier, dragons, gold) => {
            let dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
            let targetDragon = dragonsOfTier[0]
            if (targetDragon.level < 25) {
                let price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                while(price <= gold) {
                    gold -= price
                    verbose&&console.log(`upg ${targetDragon.tier}-${targetDragon.level} for ${price}, balance ${gold}`)
                    upgradeConcreteDragon(dragons, targetDragon.tier, targetDragon.level)
                    dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
                    targetDragon = dragonsOfTier[0]
                    if (targetDragon.level === 25) break
                    price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                }
            }

            if (tier > 1) {
                return tryUpgradeOnTier(tier-1, dragons, gold)
            }
            return gold
        }
        return tryUpgradeOnTier(getMaxTier(dragons), dragons, gold)
    }

    const minTierMinLevelStratUpgrade = (dragons, gold) => {
        const maxTier = getMaxTier(dragons)
        const tryUpgradeOnTier = (tier, dragons, gold) => {
            let dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
            let targetDragon = dragonsOfTier[0]
            if (targetDragon.level < 25) {
                let price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                while (price <= gold) {
                    gold -= price
                    verbose && console.log(`upg ${targetDragon.tier}-${targetDragon.level} for ${price}, balance ${gold}`)
                    upgradeConcreteDragon(dragons, targetDragon.tier, targetDragon.level)
                    dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
                    targetDragon = dragonsOfTier[0]
                    if (targetDragon.level === 25) break
                    price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                }
            }

            if (tier+1 <= maxTier) {
                return tryUpgradeOnTier(tier+1, dragons, gold)
            }
            return gold
        }
        return tryUpgradeOnTier(1, dragons, gold)
    }

    const strategyExecutor = {
        'minTierMinLevel': minTierMinLevelStratUpgrade,
        'maxTierMinLevel': maxTierMinLevelStratUpgrade
    }

    return {
        play: () => {
            const result = []
            for (let i = 0; i < maxStage; i++) {

                const stageResult = {}

                //
                // hp and gold
                const stageItems = gameData.generateStageItems(i)
                const stageGold = stageItems.reduce((acc, item) => {
                    if (item.type === ObjectType.PAID_CHEST) return acc
                    return acc + item.drops.gold
                }, 0)
                const paidGold = stageItems.reduce((acc, item) => {
                    if (item.type !== ObjectType.PAID_CHEST) return acc
                    return acc + item.drops.gold
                }, 0)
                verbose&&console.log(`%c--start stage ${i}: gold: ${stageGold}, sdacha: ${savedGold}, total: ${stageGold + savedGold}`, 'color: #CC0000')
                savedGold = savedGold + stageGold + paidGold
                const stageHP = stageItems.reduce((acc, item) => {
                    if (item.type === ObjectType.PAID_CHEST || item.type === ObjectType.PAID_EGG) return acc
                    return acc + item.health
                }, 0)
                stageResult.stageHp = stageHP

                const additional = typeof result[i-2] === 'undefined' ? 0 : result[i-2].cumulativeGold
                stageResult.cumulativeGold = stageGold + additional
                stageResult.gold = stageGold
                stageResult.paidGold = paidGold

                //
                // dragons
                const dragons = stageItems.reduce((acc, item) => {
                    if (item.drops.egg) {
                        acc.push(item.drops.egg.drops.dragon)
                    }
                    return acc
                }, [])
                if (dragons.length) {
                    verbose&&console.log(`%cnew dragons: ${dragons.map(d => `tier${d.tier}`).join(', ')}`, 'color: #0000CC')
                }
                allDragons = allDragons.concat(dragons)
                stageResult.dragons = allDragons.slice(0)
                stageResult.dragonsMaxTier = getMaxTier(dragons)


                stageResult.substageClicks = []
                const ssHP = stageHP / substages
                const ssGold = Math.floor(savedGold / substages)
                let currentSubStage = 0
                while (currentSubStage < substages) {
                    const dmg = gameData.getClickDamage2(allDragons)
                    stageResult.substageClicks.push(ssHP/dmg)

                    verbose&&console.log(`%c-substage${currentSubStage+1}/${substages}: gold: ${ssGold}`, 'background: #00AAAA')
                    const sdacha = strategyExecutor[strategy](allDragons, ssGold)
                    savedGold = savedGold - ssGold + sdacha
                    verbose&&console.log(`%c-end substage: sdacha: ${sdacha}`, 'background: #00AAAA')
                    currentSubStage+=1
                }
                verbose&&console.log(`%cSDACHA substage, balance: ${savedGold}`, 'background: #559999')
                savedGold = strategyExecutor[strategy](allDragons, savedGold)
                verbose&&console.log(`%c--end stage ${i}-----`, 'color: #CC0000')
                stageResult.clicks = stageResult.substageClicks.reduce((acc, current) => current + acc, 0)//stageHP/gameData.getClickDamage2(allDragons)
                stageResult.time = MathUtil.roundToDigit(Math.round(stageHP/gameData.getClickDamage2(allDragons)) / cps / 60, 2)
                stageResult.calcDamage = gameData.getTargetDamage(i)
                stageResult.realDamage = gameData.getClickDamage2(allDragons)


                result.push(stageResult)
            }
            return result
        }
    }
}