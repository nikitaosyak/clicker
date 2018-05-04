import {INamedUIElement, ISimpleButton, IToggleButton, TOGGLE_STATE} from "./UIElementBase";
import {IAnimated, IContainer, IParticleContainer, IText} from "../go/GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";
import {StaticImage} from "../go/StaticImage";

const BUTTON_WIDTH = 90
const BUTTON_HEIGHT = 90

export const UIFactory = {
    forParent: parent => {
        return {
            getFullScreenButton: fsElement => {
                if (typeof document.fullscreenEnabled !== undefined &&
                    window.GD.config.PLATFORM === 'standalone') {
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

            getButton: (texture, x, y, onClick, sizeX = undefined, sizeY = undefined) => {
                const button = {}
                Object.assign(button, INamedUIElement(parent, `button`))
                Object.assign(button, ISimpleButton(onClick, texture, x, y,
                    sizeX || BUTTON_WIDTH,
                    sizeY || BUTTON_HEIGHT))
                return button
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

            getContainer: (x, y) => {
                const pc = {}
                Object.assign(pc, INamedUIElement(parent, 'particleContainer'))
                Object.assign(pc, IContainer(x, y, RENDER_LAYER.UI))
                return pc
            },

            getCoinParticle: (x, y) => {
                const c = {}
                Object.assign(c, INamedUIElement(parent, 'coinParticle'))
                Object.assign(c, IAnimated('anim_coin', x, y, 60, 60))
                return c
            },

            getUpgradeInfoWidget: (x, y) => {

                const bg = StaticImage('pixel', 0, 0, 100, 100)
                const tier = UIFactory.forParent('info_widget').getText('', -30, -30, {
                    fontSize: 30, fill: '#000000'
                }, {x: 0.5, y: 0.5})
                const level = UIFactory.forParent('info_widget').getText('', 30, -30, {
                    fontSize: 30, fill: '#000000'
                }, {x: 0.5, y: 0.5})
                const price = UIFactory.forParent('info_widget').getText('', 0, 30, {
                    fontSize: 30, fill: '#ffd700'
                }, {x: 0.5, y: 0.5})

                const w = {
                    set tier(v) {tier.visual.text = `t${v}`},
                    set level(v) {level.visual.text = `l${v}`},
                    set damage(v) {},
                    set price(v) {price.visual.text = v},
                }

                Object.assign(w, IContainer(x, y))
                w.visual.addChild(bg.visual)
                w.visual.addChild(tier.visual)
                w.visual.addChild(level.visual)
                w.visual.addChild(price.visual)

                return w
            }
        }
    }
}