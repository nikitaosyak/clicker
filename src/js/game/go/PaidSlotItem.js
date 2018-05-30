import {SlotItem} from "./SlotItem";

export class PaidSlotItem extends SlotItem {
    constructor(type, slot, stage, health, drop, targetSlot) {
        super(type, slot, stage, health, drop, targetSlot)

        this._wasPaid = false
    }

    get health() { return this._wasPaid ? -1 : super.health }

    processDamage(value) {
        super.processDamage(value)

        if (this._currentClick === 1 || this._currentClick % 100 === 0) {
            if (window.confirm('купи петуха?')) {
                this._wasPaid = true
            }
        }
    }

}