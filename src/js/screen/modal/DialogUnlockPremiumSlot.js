import {DialogBase} from "./DialogBase";
import {IButton, IContainer, IText, IToggleButton, IVisual} from "../../behaviours/Base";


export class DialogUnlockPremiumSlot extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        const size = {x: 700, y: 800}

        this.visual.addChild(IVisual('pixel').setSize(size.x, size.y).setAnchor(0.5, 0.5).setTint(0xEEEEEE).visual)

        this._title = IText('something', 0, -190, {
            fontSize: 80, fill: '#BF5F2F',
            align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 3,
            wordWrap: true, wordWrapWidth: size.x-100
        }, 0.5, 0.5)
        this.visual.addChild(this._title.visual)

        this._reminder = IContainer().setPosition(-size.x/2 * 0.35, 130)
        this._button = IToggleButton('ui_checkbox_unchecked', 'ui_checkbox_checked')
            .setAnchor(1, 0.5)
            .setSize(100, 100)
        this._reminderText = IText('something', 10, 0, {
            fontSize: 40, fill: '#7F7F7F',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
        }, 0, 0.5)
        this._reminder.visual.addChild(this._button.visual)
        this._reminder.visual.addChild(this._reminderText.visual)
        this.visual.addChild(this._reminder.visual)

        this.visual.addChild(IButton('ui_cancel', () => {
            this.hide().then(this.__result({watchAd: false, remind: !this._button.toggleState}))
            this.__result = null
        }).setSize(80, 80).setAnchor(0, 1).setPosition(-size.x/2 + 75, size.y/2 - 75).visual)

        this.visual.addChild(IButton('ui_agree', () => {
            this.hide().then(this.__result({watchAd: true}))
            this.__result = null
        }).setSize(150, 150).setAnchor(1, 1).setPosition(size.x/2 - 40, size.y/2 - 40).visual)
    }

    show(isFirstReminder, suffix) {
        console.log(window.localization.get(`unlock_premium_item_text_${suffix}`))
        console.log(window.localization.get("unlock_premium_item_hide_premium_reminder"))
        this._title.visual.text = window.localization.get(`unlock_premium_item_text_${suffix}`)

        this._button.setToggleState(false)
        this._reminder.visual.visible = !isFirstReminder
        this._reminderText.visual.text = window.localization.get("unlock_premium_item_hide_premium_reminder")

        return new Promise(resolve => {
            super.show().then(() => {
                this.__result = resolve
            })
        })
    }
}