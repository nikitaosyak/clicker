import {INamedUIElement, ISimpleButton} from "./UIElementBase";
import {IAnimated, IContainer, IText} from "../go/GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";
import {StaticImage} from "../go/StaticImage";
import {IAdoptableBase, IAdoptableButton, IAdoptableToggleButton, TOGGLE_STATE} from "../stretching/AdoptableBase";

const BUTTON_WIDTH = 90
const BUTTON_HEIGHT = 90

export const UIFactory = {
    forParent: parent => {
        const self = {
            getFullScreenButton: (fsElement, anchor, pivotRules) => {
                if (typeof document.fullscreenEnabled !== undefined &&
                    window.GD.config.PLATFORM === 'standalone') {
                    const button = {}
                    Object.assign(button, INamedUIElement(parent, 'full_screen'))
                    Object.assign(button, IAdoptableToggleButton(state => {
                        if (state === TOGGLE_STATE.TOGGLED) {
                            fsElement.requestFullscreen()
                        } else {
                            document.exitFullscreen()
                        }
                    }, 'ui_fullscreen_to', 'ui_fullscreen_from', {x: BUTTON_WIDTH, y: BUTTON_HEIGHT}, anchor))
                    Object.assign(button, IAdoptableBase(button.visual, pivotRules, null))
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

            getButton2: (texture, onClick, anchor, pivotRules, name = 'button') => {
                const size = {x: BUTTON_WIDTH, y: BUTTON_HEIGHT}
                const button = {}
                Object.assign(button, INamedUIElement(parent, name))
                Object.assign(button, IAdoptableButton(onClick, texture, size, anchor))
                Object.assign(button, IAdoptableBase(button.visual, pivotRules, null))
                return button
            },

            getNavButton: (screenManager, destination, texture, anchor, pivotRules) => {
                return self.getButton2(texture, () => {
                    screenManager.transit(destination)
                }, anchor, pivotRules, `navigate_to_${destination}`)
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
        return self
    }
}