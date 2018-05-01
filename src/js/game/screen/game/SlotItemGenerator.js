import {SlotItem} from "../../go/SlotItem";
import {ObjectType} from "../../go/GameObjectBase";

export const SlotItemGenerator = (owner, model) => {


    const generateStageItems = stage => {
        //на сколько увеличивается урон каждый этап
        const stageMult = 2;

//базовый урон
        const baseDamage = 10;

//базовый урон
        const tierDamageMult = 50;

//расчётое количество кликов по паку сундуков
        const packClicksNum = 120;

//части пака (один жирный, пара средних, много мелких)
        const packConfig = [1, 0.3, 2, 0.15, 4, 0.1];

//вид дракона
        let currentTier = 1;
//доп яиц в каждом паке сундуков
        const eggDropPattern = [1, 0, 0, 1, 0 , 1 , 1 , 1, 2, 1, 2, 2, 2, 2];
//позиция в паттерне
        let currentTierDropStage = 0;

        // ускоряет прогрессию в начале
        const shiftKoef = Math.round(Math.max(100, (-0.0193 * Math.pow(stage, 3) + 1.0649 * Math.pow(stage, 2) - 18.9866 * stage + 208.7088))) / 100;
        //расчётный урон
        const targetDamage = Math.round(baseDamage * Math.pow(stageMult, stage * shiftKoef));
        const packHP = packClicksNum * targetDamage;

        //определяется порог и переключается тиер
        const nextTierBaseDamage = baseDamage * Math.pow(tierDamageMult, currentTier);
        if (packHP / nextTierBaseDamage * shiftKoef * shiftKoef > 290 * currentTier) {
            currentTier++;
            currentTierDropStage = 0;
        }

        let currentTierEggNumInPack = eggDropPattern[currentTierDropStage];
        let lastTierEggNumInPack = 2 - currentTierEggNumInPack;
        currentTierDropStage++;

        const boxData = []
        for (let p = 0; p < packConfig.length; p+=2) {
            for (let pn = 0; pn < packConfig[p]; pn++) {
                const singleBox = {
                    stage: stage,
                    health: Math.round(packConfig[p+1] * packHP)
                }
                if (currentTierEggNumInPack-- > 0) { // box drops egg
                    singleBox.egg = currentTier
                }
                if (typeof singleBox.egg === 'undefined' && currentTier > 1) {
                    if (lastTierEggNumInPack-- > 0) { // box drops egg of prev tier
                        singleBox.egg = currentTier-1
                    }
                }
                boxData.push(singleBox)
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