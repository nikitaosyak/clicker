import {DialogBase} from "./DialogBase";
import {IButton, IText, IVisual} from "../../behaviours/Base";
import {UIFactory} from "../../ui/UIFactory";
import {Slice9Stupid} from "../../ui/components/Slice9Stupid";


export class DialogRestartGame extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        const size = {x: 740, y: 1000}

        // this.visual.addChild(IVisual('ui_dialog_background2').setSize(size.x, size.y).setAnchor(0.5, 0.5).setTint(0xEEEEEE).visual)
        this.visual.addChild(Slice9Stupid('ui_sliced_dialog', size.x, size.y).visual)

        // this._title = IText(window.localization.get(`restart_dialog_title`), 0, -400, {
        //     fontSize: 80, fill: '#BF5F2F',
        //     align: 'center',
        //     dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 3,
        //     wordWrap: true, wordWrapWidth: size.x-100
        // }, 0.5, 0.5)
        // this.visual.addChild(this._title.visual)

        this._body = IText(window.localization.get(`restart_dialog_body`), 0, -180, {
            fontSize: 60, fill: '#BF5F2F',
            align: 'center',
            dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.6, dropShadowDistance: 2,
            wordWrap: true, wordWrapWidth: size.x-140
        }, 0.5, 0.5)
        this.visual.addChild(this._body.visual)

        this._reminder = UIFactory.forParent('restartGameDialog').getCheckboxTextWidget(
            {x: -5, y: 125}, 'ui_checkbox_unchecked', 'ui_checkbox_checked', null,
            {x: 100, y: 100}, window.localization.get("common_reminder_checkbox_text"), {
                fontSize: 40, fill: '#7F7F7F',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this.visual.addChild(this._reminder.visual)

        this.visual.addChild(IButton('ui_button_close_flat', () => {
            this.hide().then(this.__result({allowRestart: false, remind: !this._reminder.button.toggleState}))
            this.__result = null
        }).setSize(80, 80).setAnchor(0, 1).setPosition(-size.x/2 + 75, size.y/2 - 210).visual)

        this.visual.addChild(IText(
            window.localization.get('restart_dialog_cancel'),
            -size.x/2 + 175, size.y/2-253,
            {fontSize: 30, fill: '#9C9C9C', dropShadow: true, dropShadowBlur: 1, dropShadowDistance: 1},
            0, 0.5
        ).visual)

        this.visual.addChild(IButton('ui_button_restart_flat', () => {
            this.hide().then(this.__result({allowRestart: true}))
            this.__result = null
        }).setSize(150, 150).setAnchor(1, 1).setPosition(size.x/2 - 75, size.y/2 - 75).visual)

        this.visual.addChild(IText(
            window.localization.get('restart_dialog_ok'),
            135, size.y/2-155,
            {fontSize: 40, fill: '#E9E9E9', dropShadow: true, dropShadowBlur: 1, dropShadowDistance: 2},
            1, 0.5
        ).visual)
    }

    show(isFirstReminder, suffix) {

        this._reminder.button.setToggleState(false)
        this._reminder.visual.visible = !isFirstReminder

        return new Promise(resolve => {
            super.show().then(() => {
                this.__result = resolve
            })
        })
    }
}