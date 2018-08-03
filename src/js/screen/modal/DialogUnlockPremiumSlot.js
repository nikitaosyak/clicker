import {DialogBase} from "./DialogBase";
import {IButton, IText, IVisual} from "../../behaviours/Base";
import {UIFactory} from "../../ui/UIFactory";


export class DialogUnlockPremiumSlot extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        const size = {x: 700, y: 800}

        this.visual.addChild(IVisual('ui_dialog_background2').setSize(size.x, size.y).setAnchor(0.5, 0.5).setTint(0xEEEEEE).visual)

        this._body = IText('something', 0, -190, {
            fontSize: 80, fill: '#BF5F2F',
            align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 3,
            wordWrap: true, wordWrapWidth: size.x-100
        }, 0.5, 0.5)
        this.visual.addChild(this._body.visual)

        this._reminder = UIFactory.forParent('unlockPremiumSlotDialog').getCheckboxTextWidget(
            {x: -size.x/2 * 0.35, y: 130}, 'ui_checkbox_unchecked', 'ui_checkbox_checked', null,
            {x: 100, y: 100}, {
                fontSize: 40, fill: '#7F7F7F',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this._reminder.text.visual.text = window.localization.get("common_reminder_checkbox_text")
        this.visual.addChild(this._reminder.visual)

        this.visual.addChild(IButton('ui_cancel', () => {
            this.hide().then(this.__result({watchAd: false, remind: !this._reminder.button.toggleState}))
            this.__result = null
        }).setSize(80, 80).setAnchor(0, 1).setPosition(-size.x/2 + 75, size.y/2 - 75).visual)

        this.visual.addChild(IButton('ui_agree', () => {
            this.hide().then(this.__result({watchAd: true}))
            this.__result = null
        }).setSize(150, 150).setAnchor(1, 1).setPosition(size.x/2 - 40, size.y/2 - 40).visual)
    }

    show(isFirstReminder, suffix) {
        this._body.visual.text = window.localization.get(`unlock_premium_item_text_${suffix}`)

        this._reminder.button.setToggleState(false)
        this._reminder.visual.visible = !isFirstReminder

        return new Promise(resolve => {
            super.show().then(() => {
                this.__result = resolve
            })
        })
    }
}