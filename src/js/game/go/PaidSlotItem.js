import {SlotItem} from "./SlotItem";
import {DAMAGE_SOURCE} from "../DamageSource";

export class PaidSlotItem extends SlotItem {
    constructor(type, slot, stage, health, drop, targetSlot) {
        super(type, slot, stage, health, drop, targetSlot)

        this._wasPaid = false
        this._fingerClick = 0
    }

    get health() { return this._wasPaid ? -1 : super.health }

    processDamage(value, source) {
        super.processDamage(value)

        if (source !== DAMAGE_SOURCE.CLICK) return
        this._fingerClick += 1
        if (this._fingerClick === 1 || this._fingerClick % 30 === 0) {
            if (window.confirm('watch ad?')) {
                this._wasPaid = true
            }
        }
    }

}