import {SlotItem} from "./SlotItem";
import {DAMAGE_SOURCE} from "./DamageSource";
import {ObjectType} from "../behaviours/Base";

export class PaidSlotItem extends SlotItem {
    constructor(type, slot, stage, health, drop, targetSlot, opener, healthbar) {
        super(type, slot, stage, health, drop, targetSlot, opener, healthbar)

        this._fingerClick = 0
        this._firstReminder = true
        this._hideDialog = false
    }

    processDamage(value, source) {
        super.processDamage(value)

        if (source !== DAMAGE_SOURCE.CLICK) return

        if (this._hideDialog) return

        this._fingerClick += 1
        if (this._fingerClick === 1 || this._fingerClick % 2 === 0) {
            const suffix = this.type === ObjectType.PAID_CHEST ? 'chest' : 'egg'
            window.dialogs.showPremiumUnlock(this._firstReminder, suffix).then(result => {
                this._firstReminder = false
                if (result.watchAd) {
                    this._currentHealth = 0
                    this._opener.openItem.call(this._opener, this)
                } else {
                    this._hideDialog = !result.remind
                }
            })
        }
    }

}