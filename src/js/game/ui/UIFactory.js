import {INamedUIElement, ISimpleButton, IToggleButton, TOGGLE_STATE} from "./UIElementBase";
import {IAnimated, IParticleContainer, IText} from "../go/GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

const BUTTON_WIDTH = 90
const BUTTON_HEIGHT = 90

export const UIFactory = {
    forParent: parent => {
        return {
            getFullScreenButton: fsElement => {
                if (typeof document.fullscreenEnabled !== undefined &&
                    window.ENV.PLATFORM === 'standalone') {
                    const button = {}
                    Object.assign(button, INamedUIElement(parent, 'full_screen'))
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
                Object.assign(button, INamedUIElement(parent, `navigate_to_${destination}`))
                Object.assign(button, ISimpleButton(() => {
                    screenManager.transit(destination)
                }, texture, x, y, BUTTON_WIDTH, BUTTON_HEIGHT))
                return button
            },

            getText: (text, x, y, style, anchor) => {
                const t = {}
                Object.assign(t, INamedUIElement(parent, `text`))
                Object.assign(t, IText(text, x, y, style, anchor.x, anchor.y, RENDER_LAYER.UI))
                return t
            },

            getParticleContainer: () => {
                const pc = {}
                Object.assign(pc, INamedUIElement(parent, 'particleContainer'))
                Object.assign(pc, IParticleContainer(RENDER_LAYER.UI))
                return pc
            },

            getCoinParticle: (x, y) => {
                const c = {}
                Object.assign(c, INamedUIElement(parent, 'coinParticle'))
                Object.assign(c, IAnimated('anim_coin', x, y, 60, 60))
                return c
            },
        }
    }
}