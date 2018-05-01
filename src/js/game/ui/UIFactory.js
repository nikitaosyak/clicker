import {INamedUIElement, ISimpleButton, IToggleButton, TOGGLE_STATE} from "./UIElementBase";

export const UIFactory = {
    forScreen: screen => {
        return {
            getFullScreenButton: fsElement => {
                if (typeof document.fullscreenEnabled !== undefined &&
                    window.ENV.PLATFORM === 'standalone') {
                    const button = {}
                    Object.assign(button, INamedUIElement(screen, 'full_screen'))
                    Object.assign(button, IToggleButton(state => {
                        if (state === TOGGLE_STATE.TOGGLED) {
                            fsElement.requestFullscreen()
                        } else {
                            document.exitFullscreen()
                        }
                    }, 'ui_fullscreen_to', 'ui_fullscreen_from', 720, 80, 90, 90))

                    return button
                }
                return null
            },

            getNavButton: (screenManager, destination, texture, x, y, w, h) => {
                const button = {}
                Object.assign(button, INamedUIElement(screen, `navigate_to_${destination}`))
                Object.assign(button, ISimpleButton(() => {
                    screenManager.transit(destination)
                }, texture, x, y, w, h))
                return button
            }
        }
    }
}