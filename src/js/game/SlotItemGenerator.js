import {SlotItem} from "./go/SlotItem";
import {ObjectType} from "./go/GameObjectBase";

export const SlotItemGenerator = owner => {

    return {
        populate: slots => {
            for (let i = 0; i < slots.length; i++) {
                if (slots[i] === null) {
                    const type = Math.random() < 0.9 ? ObjectType.CHEST : ObjectType.EGG
                    const tier = Math.random() > 0.5 ? 1 : 2
                    slots[i] = SlotItem(type, tier, i)
                    owner.add(slots[i])
                }
            }
        }
    }
}