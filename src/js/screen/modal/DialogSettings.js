import {DialogBase} from "./DialogBase";
import {IButton, IVisual} from "../../behaviours/Base";
import {UIFactory} from "../../ui/UIFactory";

export class DialogSettings extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        this._settings = null
        const size = {x: 500, y: 400}

        this.visual.addChild(IVisual('ui_dialog_background2').setSize(size.x, size.y).setAnchor(0.5, 0.5).setTint(0xEEEEEE).visual)

        this._musicCheck = UIFactory.forParent('settingsDialog').getCheckboxTextWidget(
            {x: -size.x/2 * 0.4, y: -100}, 'ui_unmute', 'ui_mute', state => {
                this._settings.music = !state
                window.soundman.applySettings(this._settings)
            },
            {x: 100, y: 100}, {
                fontSize: 40, fill: '#7F7F7F',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this._musicCheck.text.visual.text = window.localization.get('settings_music')
        this.visual.addChild(this._musicCheck.visual)

        this._sfxCheck = UIFactory.forParent('settingsDialog').getCheckboxTextWidget(
            {x: -size.x/2 * 0.4, y: 50}, 'ui_unmute', 'ui_mute', state => {
                this._settings.sfx = !state
                window.soundman.applySettings(this._settings)
            },
            {x: 100, y: 100}, {
                fontSize: 40, fill: '#7F7F7F',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this._sfxCheck.text.visual.text = window.localization.get('settings_sfx')
        this.visual.addChild(this._sfxCheck.visual)

        this.visual.addChild(IButton('ui_agree', () => {
            this.hide().then(this.__result(this._settings))
            this.__result = null
            this._settings = null
        }).setSize(120, 120).setAnchor(0.5, 0.5).setPosition(0, size.y/2).visual)
    }

    show(currentSettings) {

        this._settings = currentSettings

        this._musicCheck.button.setToggleState(!currentSettings.music)
        this._sfxCheck.button.setToggleState(!currentSettings.sfx)

        return new Promise(resolve => {
            super.show().then(() => {
                this.__result = resolve
            })
        })
    }
}