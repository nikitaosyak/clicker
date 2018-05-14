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
    const packClicksNum = 120   //расчётое количество кликов по паку сундуков
    const packConfig = [1, 0.3, 2, 0.15, 4, 0.1] //части пака (один жирный, пара средних, много мелких)
    const packSlotOrder = [-1, 2, -1, 1, -1, 0]
    const tierSwitchThresholdMultiplier = 1.3
    const minGoldDrop = 500     //стартовый дроп золота

    let currentTier = 1         //вид дракона
    const eggDropPattern = [1, 0, 1, 0, 1 , 1 , 2 , 1, 2, 2, 2, 2, 2, 2] //доп яиц в каждом паке сундуков
    let currentTierDropStage = 0//позиция в паттерне

    const getUpgradePrice = (tier, level) => {
        if (tier > 1) return basePrice * level * Math.pow(tierPriceMult, tier - 1)
        return basePrice * level
    };

    const getTierBaseDamage = (tier) => {
        if (tier > 1) return baseDamage * Math.pow(tierDamageMult, tier - 1)
        return baseDamage
    };

    const getTierDamage = (tier, level) => {
        return Math.round(getTierBaseDamage(tier) * (Math.pow(1.26, 1.1 * level) + level) / 1.5)
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
            return (baseDamage + damage)// * 20
        },

        generateStageItems: (stage, shallow = false) => {
            const shiftKoef = Math.round(Math.max(100, (-0.0193 * Math.pow(stage, 3) + 1.0649 * Math.pow(stage, 2) - 18.9866 * stage + 208.7088))) / 100
            const targetDamage = Math.round(baseDamage * Math.pow(stageMult, stage * shiftKoef))
			const clearTargetDamage = Math.round(baseDamage * Math.pow(stageMult, stage))
            const packHP = packClicksNum * targetDamage

            //определяется порог и переключается тиер
            const nextTierBaseDamage = getTierBaseDamage(currentTier + 1)
            if (clearTargetDamage / nextTierBaseDamage / shiftKoef > tierSwitchThresholdMultiplier * currentTier) {
                currentTier++
                currentTierDropStage = 0
            }

            //сколько дропать яиц и каких
            let currentTierEggNumInPack = eggDropPattern[currentTierDropStage]
            let lastTierEggNumInPack = 2 - currentTierEggNumInPack
            currentTierDropStage++
			
			let moneyDrop = minGoldDrop
			let moneyDropStage = 0
			while (moneyDropStage++ < stage) {
				moneyDrop *= 1.54
			}
			moneyDrop *= shiftKoef * shiftKoef
			
            if (shallow) return

            const chestData = []
            for (let p = 0; p < packConfig.length; p+=2) {
                for (let pn = 0; pn < packConfig[p]; pn++) {
                    const singleChest = {
                        type: ObjectType.CHEST,
                        stage: stage,
                        health: Math.round(packConfig[p+1] * packHP),
                        slot: packSlotOrder[p+1],
                        drops: {
                            [ObjectType.GOLD]: Math.round(packConfig[p+1] * moneyDrop)
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
			console.log("generateStageItems: targetDamage " + targetDamage + ", moneyDrop " + Math.round(moneyDrop) + ", shiftKoef " + shiftKoef + ' \ ' + shiftKoef * shiftKoef)

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