import {Config} from "./Config";
import {ObjectType} from "./game/go/GameObjectBase";

export const GameData = (model) => {

    const config = Config()
    const slots  = [
        {x: 140, y: 1100, w: 250, h: 300},
        {x: 400, y: 1100, w: 250, h: 300},
        {x: 660, y: 1100, w: 250, h: 300}
    ]

    const stageMult = 2         //на сколько увеличивается урон каждый этап
    const baseDamage = 10       //базовый урон
    const basePrice = 100       //базовая цена
    const tierDamageMult = 50   //множитель след тира
    const tierPriceMult = 10    //множитель след тира
    const packClicksNum = 60   //расчётое количество кликов по паку сундуков
    const packConfig = [1, 0.3, 2, 0.15, 4, 0.1] //части пака (один жирный, пара средних, много мелких)
    const tierSwitchThresholdMultiplier = 60
    let minGoldDrop = 200     //минимальный дроп золота

    let currentTier = 1         //вид дракона
    const eggDropPattern = [1, 0, 0, 1, 0 , 1 , 1 , 1, 2, 1, 2, 2, 2, 2] //доп яиц в каждом паке сундуков
    let currentTierDropStage = 0//позиция в паттерне

    const dragonsCountByTier = [0,0]
    const dragonsUpgradeByTier = [1,1]

    const getUpgradePrice = (tier, level) => {
        if (tier > 1) return basePrice * Math.pow(tierPriceMult, tier - 1)
        return basePrice * level
    };

    const getTierBaseDamage = (tier) => {
        if (tier > 1) return baseDamage * Math.pow(tierDamageMult, tier - 1)
        return baseDamage
    };

    const getTierDamage = (tier, level) => {
        return getTierBaseDamage(tier) * level
    };

    const self =  {
        get config() { return config },
        get slots() { return slots },
        getSlotRect(at) { return slots[at]},

        getUpgradePrice: (tier, level) => getUpgradePrice(tier, level),
        getSingleDragonDamage: (tier, level) => getTierDamage(tier, level),
        getClickDamage: dragons => {
            let damage = 0
            Object.keys(dragons).forEach(tier => {
                dragons[tier].forEach(d => {
                    damage += getTierDamage(d.tier, d.level)
                })
            })
            return (baseDamage + damage)// * 4
        },

        generateStageItems: (stage, shallow = false) => {
            const shiftKoef = Math.round(Math.max(100, (-0.0193 * Math.pow(stage, 3) + 1.0649 * Math.pow(stage, 2) - 18.9866 * stage + 208.7088))) / 100
            const targetDamage = Math.round(baseDamage * Math.pow(stageMult, stage * shiftKoef))
            const packHP = packClicksNum * targetDamage

            //определяется порог и переключается тиер
            const nextTierBaseDamage = getTierBaseDamage(currentTier + 1)
            if (packHP / nextTierBaseDamage * shiftKoef * shiftKoef > tierSwitchThresholdMultiplier * currentTier) {
                currentTier++
                currentTierDropStage = 0
                dragonsCountByTier.push(0)
                dragonsUpgradeByTier.push(1)
            }

            //сколько дропать яиц и каких
            let currentTierEggNumInPack = eggDropPattern[currentTierDropStage]
            let lastTierEggNumInPack = 2 - currentTierEggNumInPack
            currentTierDropStage++

            dragonsCountByTier[currentTier] += currentTierEggNumInPack
            if (currentTier > 1) dragonsCountByTier[currentTier - 1] += lastTierEggNumInPack

            //вычисляю текущий урон расчётного набора драконов и их апгрейдов
            let sumDamage =  0
            for (let dt = 0; dt < dragonsCountByTier.length; dt++) {
                const dragonsCount = dragonsCountByTier[dt]
                const dragonsUpdrage = dragonsUpgradeByTier[dt]
                sumDamage += getTierDamage(dt, dragonsUpdrage) * dragonsCount
            }

            //делаю апгрейды неаобходимые для того чтобы покрыть недостаток урона
            let damageDiff = targetDamage - sumDamage
            let sumMoney = 0
            for (let dt = currentTier; dt > 0; dt--) {
                const dragonsCount = dragonsCountByTier[dt]
                let dragonsUpdrage = dragonsUpgradeByTier[dt]
                const dmg = getTierDamage(dt, dragonsUpdrage) * dragonsCount;
                while (damageDiff > dmg) {
                    damageDiff -= dmg
                    sumMoney += getUpgradePrice(dt, dragonsUpdrage)
                    dragonsUpdrage++
                }
                dragonsUpgradeByTier[dt] = dragonsUpdrage
            }

            minGoldDrop = Math.max(minGoldDrop, sumMoney)
            if (shallow) return

            const chestData = []
            for (let p = 0; p < packConfig.length; p+=2) {
                for (let pn = 0; pn < packConfig[p]; pn++) {
                    const singleChest = {
                        type: ObjectType.CHEST,
                        stage: stage,
                        health: Math.round(packConfig[p+1] * packHP),
                        drops: {
                            [ObjectType.GOLD]: Math.round(packConfig[p+1] * minGoldDrop)
                        }
                    }

                    if (currentTierEggNumInPack-- > 0) { // drops egg
                        singleChest.drops[ObjectType.EGG] = {
                            type: ObjectType.EGG,
                            stage: stage,
                            health: singleChest.health/2,
                            drops: {[ObjectType.DRAGON]: {tier: currentTier, level: 1}}
                        }
                    } else if (currentTier > 1) {        // drops egg from prev stage
                        if (lastTierEggNumInPack-- > 0) {
                            singleChest.drops[ObjectType.EGG] = {
                                type: ObjectType.EGG,
                                stage: stage,
                                health: singleChest.health/2,
                                drops: {[ObjectType.DRAGON]: {tier: currentTier-1, level: 1}}
                            }
                        }
                    }
                    chestData.push(singleChest)
                }
            }

            return chestData
        }
    }

    // integral progress to current stage
    for (let i = 0; i < model.stage; i++) {
        self.generateStageItems(i, true)
    }
    // const result = {}
    // for (let i = 0; i < 40; i++) {
    //     result[`stage${i}`] = self.generateStageItems(i).map(chest => `[${chest.stage}:${chest.health}, {g:${chest.drops.gold}${chest.drops.egg?'; d' + chest.drops.egg.drops.dragon.tier : ''}}]`)
    // }
    // console.log(JSON.stringify(result, null, '  '))

    return self
}