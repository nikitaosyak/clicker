import {IToggleButton, TOGGLE_STATE} from "./UIElementBase";

export const FullScreenButton = (element) => {
    const self = {}
    Object.assign(self, IToggleButton(state => {
        if (state === TOGGLE_STATE.TOGGLED) {
            element.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }, 'ui_fullscreen_to', 'ui_fullscreen_from', 720, 80, 90, 90))

    return self
}