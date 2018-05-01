import {SlotItem} from "../../go/SlotItem";
import {ObjectType} from "../../go/GameObjectBase";

export const SlotItemGenerator = (owner, model) => {


    const generateStageItems = stage => {
        const stageMult = 2         //на сколько увеличивается урон каждый этап
        const baseDamage = 10       //базовый урон
        const basePrice = 100       //базовая цена
        const tierDamageMult = 50   //множитель след тира
        const tierPriceMult = 10    //множитель след тира
        const packClicksNum = 120   //расчётое количество кликов по паку сундуков
        const packConfig = [1, 0.3, 2, 0.15, 4, 0.1] //части пака (один жирный, пара средних, много мелких)
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

        const shiftKoef = Math.round(Math.max(100, (-0.0193 * Math.pow(stage, 3) + 1.0649 * Math.pow(stage, 2) - 18.9866 * stage + 208.7088))) / 100
        const targetDamage = Math.round(baseDamage * Math.pow(stageMult, stage * shiftKoef))
        const packHP = packClicksNum * targetDamage

        //определяется порог и переключается тиер
        const nextTierBaseDamage = getTierBaseDamage(currentTier + 1)
        if (packHP / nextTierBaseDamage * shiftKoef * shiftKoef > 290 * currentTier) {
            currentTier++
            currentTierDropStage = 0
            // droplist.push([]);
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
            const additionalTierUpgrade = 0 // TODO: this is unused
            const dmg = getTierDamage(dt, dragonsUpdrage) * dragonsCount;
            while (damageDiff > dmg) {
                damageDiff -= dmg
                sumMoney += getUpgradePrice(dt, dragonsUpdrage)
                dragonsUpdrage++
            }
            dragonsUpgradeByTier[dt] = dragonsUpdrage
        }

        minGoldDrop = Math.max(minGoldDrop, sumMoney)

        const boxData = []
        for (let p = 0; p < packConfig.length; p+=2) {
            for (let pn = 0; pn < packConfig[p]; pn++) {
                const singleBox = {
                    stage: stage,
                    health: Math.round(packConfig[p+1] * packHP),
                    gold: Math.round(packConfig[p+1] * minGoldDrop)
                }

                if (currentTierEggNumInPack-- > 0) { // drops egg
                    singleBox.egg = currentTier
                } else if (currentTier > 1) {        // drops egg from prev stage
                    if (lastTierEggNumInPack-- > 0) {
                        singleBox.egg = currentTier - 1
                    }
                }
                boxData.push(singleBox)
                // //жто для дебга
                // if (boxDropEgg) {
                //     droplist[currentTier-1][stage] = 1;
                // }
                // if (boxDropLastTierEgg) {
                //     droplist[currentTier-2][stage] = 1;
                // }
            }
        }

        return boxData
    }

    let currentStageItems = generateStageItems(model.stage)

    return {
        populate: slots => {
            for (let i = 0; i < slots.length; i++) {
                if (slots[i] === null) {
                    if (currentStageItems.length === 0) {
                        model.increaseStage()
                        currentStageItems = generateStageItems(model.stage)
                    }
                    const boxData = currentStageItems.splice(0, 1)[0]
                    console.log(`populating slot ${i} with data`, boxData)
                    const box = SlotItem(ObjectType.CHEST, i, boxData.stage, boxData.health, boxData.egg)
                    owner.add(box)
                    slots[i] = box
                }
            }
        }
    }
}