import {DialogBase} from "./DialogBase";
import {IButton, IText, IVisual} from "../../behaviours/Base";
import {UIFactory} from "../../ui/UIFactory";
import {Slice9Stupid} from "../../ui/components/Slice9Stupid";


export class DialogUnlockPremiumSlot extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        const size = {x: 700, y: 900}

        this.visual.addChild(Slice9Stupid('ui_sliced_dialog', size.x, size.y).visual)

        this.visual.addChild(IVisual('ui_dialog_towel')
            .setSize(size.x*0.78, size.y*0.15).setAnchor(0.5, 0).setPosition(0, -size.y/2+38).visual)

        this.visual.addChild(IText(window.localization.get('unlock_premium_item_title'), 0, -size.y/2 + 85, {
            fontSize: 60, fill: '#f8a420', align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.95, dropShadowDistance: 4
        }, 0.5, 0.5).visual)

        this._body = IText('something', 0, -125, {
            fontSize: 40, fill: '#f8a420',
            align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 3,
            wordWrap: true, wordWrapWidth: size.x-160
        }, 0.5, 0.5)
        this.visual.addChild(this._body.visual)

        this.visual.addChild(IText(window.localization.get('unlock_premium_item_question'), 0, size.y/2 - 260, {
            fontSize: 40, fill: '#f8a420', align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 3
        }, 0.5, 0.5).visual)

        this._reminder = UIFactory.forParent('unlockPremiumSlotDialog').getCheckboxTextWidget(
            {x: -5, y: size.y/2 - 390}, 'ui_checkbox_unchecked', 'ui_checkbox_checked', null,
            {x: 80, y: 80}, window.localization.get("common_reminder_checkbox_text"), {
                fontSize: 36, fill: '#7F7F7F',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this.visual.addChild(this._reminder.visual)

        this.visual.addChild(IButton('ui_button_close_flat', () => {
            this.hide().then(this.__result({watchAd: false, remind: !this._reminder.button.toggleState}))
            this.__result = null
        }).setSize(130, 130).setAnchor(0, 1).setPosition(-size.x/2 + 80, size.y/2 - 80).visual)

        this.visual.addChild(IButton('ui_button_ok_flat', () => {
            this.hide().then(this.__result({watchAd: true}))
            this.__result = null
        }).setSize(130, 130).setAnchor(1, 1).setPosition(size.x/2 - 80, size.y/2 - 80).visual)
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