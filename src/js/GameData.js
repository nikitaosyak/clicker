import {Config} from "./Config";
import {ObjectType} from "./game/go/GameObjectBase";
import {AB} from "./AB";

export const GameData = (model) => {

    const config = Config()
    const slots  = [
        {x: 140, y: 1100, w: 250, h: 300},
        {x: 400, y: 1100, w: 250, h: 300},
        {x: 660, y: 1100, w: 250, h: 300}
    ]

	const contentTimeMins = 60;
	const clickPerSecs = 3;
	const stageMaxNum = 40;
	const stageTimeSecs = (contentTimeMins * 60) / stageMaxNum;
	
    const stagePow = 2.17         //на сколько увеличивается урон каждый этап
    const stageShift = 1.03
    const stageShiftAB2 = 0.995
	const stageScale = 0.5
    const baseDamage = 10       //базовый урон
    const basePrice = 100       //базовая цена
    const tierDamageMult = 100   //множитель след тира
    const tierPriceMult = 10    //множитель след тира
    const tierMax = 6
    const packClicksNum = stageTimeSecs * clickPerSecs //расчётое количество кликов по паку сундуков
    const packConfig = [1, 0.3, 2, 0.15, 4, 0.1] //части пака (один жирный, пара средних, много мелких) (1 штука 0.3 от общей массы хп, 2 штуки 0.15 от общей массы хп...)
    const packSlotOrder = [-1, 2, -1, 1, -1, 0]
    const tierSwitchThresholdMultiplier = 2.3
    const minGoldDrop = 400     //стартовый дроп золота
	const maxMoneyBoost = 2 

    let currentTier = 1         //вид дракона
    const eggDropPattern = [1, 0, 1, 0, 1 , 1 , 2 , 1, 2, 2, 2, 1, 2, 2] //доп яиц в каждом паке сундуков
    let currentTierDropStage = 0//позиция в паттерне
	let moneyBoostCounter = 0

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
		get clickPerSecs() { return clickPerSecs },
        getShiftKoef: stage => {
            return Math.round(Math.max(100, (-0.0193 * Math.pow(stage, 3) + 1.0649 * Math.pow(stage, 2) - 18.9866 * stage + 208.7088))) / 100
        },
        getTargetDamage: stage => {
			var ss = stageShift;
			if ((model.ab & AB.GOLDPACKS) > 0) {
				ss = stageShiftAB2
			}
            return Math.round(baseDamage * Math.pow(stagePow, stage * ss) * stageScale * self.getShiftKoef(stage)) 
        },
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
        getClickDamage2: flatDragons => {
            let damage = 0
            flatDragons.forEach(d => {
                damage += getTierDamage(d.tier, d.level)
            })
            return (baseDamage + damage)// * 20
        },
        progressToStage: stage => {
            for (let i = 0; i < stage; i++) {
                self.generateStageItems(i, true)
            }
        },
        generateStageItems: (stage, shallow = false) => {
            const shiftKoef = self.getShiftKoef(stage)
			const clearTargetDamage = Math.round(baseDamage * Math.pow(stagePow, stage))
            const packHP = packClicksNum * self.getTargetDamage(stage)

            //определяется порог и переключается тиер
            const nextTierBaseDamage = getTierBaseDamage(currentTier + 1)
            let tierJustSwitched = false
            if (currentTier < tierMax && clearTargetDamage / nextTierBaseDamage > tierSwitchThresholdMultiplier * currentTier) {
                tierJustSwitched = true
                currentTier++
                currentTierDropStage = 0
            }

            //сколько дропать яиц и каких
            let currentTierEggNumInPack = eggDropPattern[currentTierDropStage] || 2;
            let lastTierEggNumInPack = 2 - currentTierEggNumInPack
            currentTierDropStage++
			
			let moneyDrop = minGoldDrop
			if ((model.ab & AB.GOLDPACKS) > 0) {
				moneyDrop = 100
			}
			let moneyDropStage = 0
			while (moneyDropStage++ < stage) {
				if ((model.ab & AB.GOLDPACKS) > 0) {
					moneyDrop *= 1.47
				}
				else 
				{
					moneyDrop *= 1.52
				}
			}
			//moneyDrop /= shiftKoef * shiftKoef
			
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
                        if (tierJustSwitched && (model.ab & AB.DRAGONS) > 0) {
                            singleChest.drops[ObjectType.EGG] = {
                                type: ObjectType.PAID_EGG,
                                stage: stage,
                                health: 0,
                                drops: {[ObjectType.DRAGON]: {tier: currentTier, level: 1}}
                            }
                        } else {
                            singleChest.drops[ObjectType.EGG] = {
                                type: ObjectType.EGG,
                                stage: stage,
                                health: singleChest.health/2,
                                drops: {[ObjectType.DRAGON]: {tier: currentTier, level: 1}}
                            }
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
            if (moneyBoostCounter < maxMoneyBoost && (model.ab & AB.GOLDPACKS) > 0 && clearTargetDamage / nextTierBaseDamage > tierSwitchThresholdMultiplier * currentTier * 0.4) {
				moneyBoostCounter++;
                chestData.push({
                    type: ObjectType.PAID_CHEST,
                    stage: stage,
                    health: 0,
                    slot: 1,
                    drops: {
                        [ObjectType.GOLD]: Math.round(moneyDrop) * 10
                    }
                })
            } else if (moneyBoostCounter > 0) {
				moneyBoostCounter--
			}
			// console.log("generateStageItems: targetDamage " + self.getTargetDamage(stage) +
             //    ", moneyDrop " + Math.round(moneyDrop) +
             //    ", shiftKoef " + shiftKoef + ' \ ' + shiftKoef * shiftKoef)

            return chestData
        }
    }

    // integral progress to current stage
    self.progressToStage(model.stage)
    // const result = {}
    // for (let i = 0; i < 40; i++) {
    //     result[`stage${i}`] = self.generateStageItems(i).map(chest => `[${chest.stage}:${chest.health}, {g:${chest.drops.gold}${chest.drops.egg?'; d' + chest.drops.egg.drops.dragon.tier : ''}}]`)
    // }
    // console.log(JSON.stringify(result, null, '  '))

    return self
}