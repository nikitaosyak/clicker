import {BaseScreen} from "./screen/BaseScreen";
import {SCREEN_TYPE} from "./screen/ScreenMan";
import {UIFactory} from "./ui/UIFactory";

export class UpgradeScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.UPGRADE)

        const uiCreator = UIFactory.forScreen(this.type)
        const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(owner, SCREEN_TYPE.GAME, 'ui_right_arrow', 720, 180, 90, 90))
    }
}