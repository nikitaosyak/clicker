import {DialogBase} from "./DialogBase";
import {IButton, IVisual} from "../../behaviours/Base";


export class DialogUnlockPremiumSlot extends DialogBase {

    constructor(owner) {
        super(owner)
        this.__result = null

        const size = {x: 600, y: 700}

        this.visual.addChild(IVisual('pixel').setSize(size.x, size.y).setAnchor(0.5, 0.5).visual)

        // this._remindBtn =

        this.visual.addChild(IButton('ui_cancel', () => {
            this.hide().then(this.__result(false))
            this.__result = null
        }).setSize(80, 80).setAnchor(0, 1).setPosition(-size.x/2 + 75, size.y/2 - 75).visual)

        this.visual.addChild(IButton('ui_agree', () => {
            this.hide().then(this.__result(true))
            this.__result = null
        }).setSize(150, 150).setAnchor(1, 1).setPosition(size.x/2 - 40, size.y/2 - 40).visual)
    }

    show(firstReminder) {
        return new Promise(resolve => {
            super.show().then(() => {
                this.__result = resolve
            })
        })
    }
}