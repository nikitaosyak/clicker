import {SlotItem} from "./SlotItem";

export class PaidSlotItem extends SlotItem {
    constructor(type, slot, stage, health, drop, targetSlot) {
        super(type, slot, stage, health, drop, targetSlot)

        this._wasPaid = false
    }

    get health() { return this._wasPaid ? -1 : super.health }

    processDamage(value) {
        super.processDamage(value)

        if (this._currentClick === 10 || this._currentClick % 50 === 0) {
            if (window.confirm('посмотреть рекламу?')) {
                this._wasPaid = true
            }
        }
    }

}