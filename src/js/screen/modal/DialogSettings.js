import {DialogBase} from "./DialogBase";
import {IButton, IVisual} from "../../behaviours/Base";
import {NUMERIC_FONT, UIFactory} from "../../ui/UIFactory";
import {Slice9Stupid} from "../../ui/components/Slice9Stupid";

export class DialogSettings extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        this._settings = null
        const size = {x: 500, y: 600}

        this.visual.addChild(Slice9Stupid('ui_sliced_dialog', size.x, size.y).visual)

        this._musicCheck = UIFactory.forParent('settingsDialog').getCheckboxTextWidget2(
            {x: -160, y: -120}, 'ui_unmute', 'ui_mute', state => {
                this._settings.music = !state
                window.soundman.applySettings(this._settings)
            }, {x: 100, y: 100}, window.localization.get('settings_music'), {
                fontSize: 40, fill: '#DDDDDD',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this.visual.addChild(this._musicCheck.visual)

        this._sfxCheck = UIFactory.forParent('settingsDialog').getCheckboxTextWidget2(
            {x: -160, y: 0}, 'ui_unmute', 'ui_mute', state => {
                this._settings.sfx = !state
                window.soundman.applySettings(this._settings)
            }, {x: 100, y: 100}, window.localization.get('settings_sfx'), {
                fontSize: 40, fill: '#DDDDDD',
                dropShadow: true, dropShadowBlur: 1, dropShadowAlpha: 0.5, dropShadowDistance: 2
            }
        )
        this.visual.addChild(this._sfxCheck.visual)

        this.visual.addChild(IButton('ui_button_ok_flat', () => {
            this.hide().then(this.__result(this._settings))
            this.__result = null
            this._settings = null
        }).setSize(120, 120).setAnchor(0.5, 1).setPosition(0, size.y/2-80).visual)
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