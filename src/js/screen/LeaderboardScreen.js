import {SCREEN_TYPE} from "./ScreenMan";
import {BaseScreen} from "./BaseScreen";
import {UIFactory} from "../ui/UIFactory";

export class LeaderboardScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.LEADERBOARD)

        const uiCreator = UIFactory.forParent(this.type)
        // const fs = uiCreator.getFullScreenButton(owner.renderer.dom); fs && this.addControl(fs)
        this.addControl(uiCreator.getNavButton(
            owner, SCREEN_TYPE.GAME,
            'ui_left_arrow', {x: 0, y: 0}, {x: 'left', xOffset: 40, y: 'top', yOffset: 40}))
    }
}