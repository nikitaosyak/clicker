import {SlotItem} from "./SlotItem";
import {DAMAGE_SOURCE} from "./DamageSource";

export class PaidSlotItem extends SlotItem {
    constructor(type, slot, stage, health, drop, targetSlot, opener) {
        super(type, slot, stage, health, drop, targetSlot, opener)

        this._fingerClick = 0
        this._firstReminder = true
    }

    processDamage(value, source) {
        super.processDamage(value)

        if (source !== DAMAGE_SOURCE.CLICK) return

        this._fingerClick += 1
        if (this._fingerClick === 1 || this._fingerClick % 30 === 0) {
            window.dialogs.showPremiumUnlock(this._firstReminder).then(result => {
                this._firstReminder = false
                if (result) {
                    this._currentHealth = 0
                    this._opener.openItem.call(this._opener, this)
                }
            })
        }
    }

}