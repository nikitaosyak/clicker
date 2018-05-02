import {INamedUIElement, ISimpleButton, IToggleButton, TOGGLE_STATE} from "./UIElementBase";

const BUTTON_WIDTH = 90
const BUTTON_HEIGHT = 90

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
                    }, 'ui_fullscreen_to', 'ui_fullscreen_from', 720, 80, BUTTON_WIDTH, BUTTON_HEIGHT))

                    return button
                }
                return null
            },

            getNavButton: (screenManager, destination, texture, x, y) => {
                const button = {}
                Object.assign(button, INamedUIElement(screen, `navigate_to_${destination}`))
                Object.assign(button, ISimpleButton(() => {
                    screenManager.transit(destination)
                }, texture, x, y, BUTTON_WIDTH, BUTTON_HEIGHT))
                return button
            }
        }
    }
}