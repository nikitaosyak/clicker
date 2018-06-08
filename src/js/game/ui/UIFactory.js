import {INamedUIElement, ISimpleButton} from "./UIElementBase";
import {IAnimated, IContainer, IText} from "../go/GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";
import {StaticImage} from "../go/StaticImage";
import {IAdoptableBase, IAdoptableButton, IAdoptableToggleButton, TOGGLE_STATE} from "../stretching/AdoptableBase";
import {MathUtil} from "../../utils/MathUtil";

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

            getLevelIndicatorWidget: () => {
                const background = StaticImage('ui_white_circle', 0, 0, 80, 80, undefined, {x: 0.5, y: 0.5})
                const levelVis = UIFactory.forParent('level_indicator').getText('', 0, 0, {
                    fontSize: 30, fill: '#000000'
                }, {x: 0.5, y: 0.5})

                background.setLevel = v => {
                    levelVis.visual.text = v
                }
                background.visual.addChild(levelVis.visual)

                return background
            },

            getUpgradeButton: (onClick) => {
                const btn = self.getButton('ui_long_button_bg', 0, 0, onClick, 300, 100)
                const icon = StaticImage('ui_upgrade_dragon', 0, 4, 80, 80, undefined, {x: 0, y: 0.5})
                btn.visual.addChild(icon.visual)

                const price = UIFactory.forParent('upgrade_button').getText('', 0, 0, {
                    fontSize: 30, fill: '#000000'
                }, {x: 0, y: 0.5})
                btn.visual.addChild(price.visual)

                btn.setPrice = v => {
                    price.visual.text =  MathUtil.convert(v)
                    const totalW = icon.visual.width + price.visual.width + 20
                    icon.visual.x = -totalW/2
                    price.visual.x = icon.visual.x + icon.visual.width + 20
                }

                return btn
            },

            getDamagePercentWidget: () => {

                const icon = StaticImage('ui_attack', 0, 0, 80, 80, undefined, {x: 1, y: 0.5})
                icon.visual.x = -5
                const damage = UIFactory.forParent('info_widget').getText('', 0, 0, {
                    fontSize: 45, fill: '#11cccc'
                }, {x: 0, y: 0.5})

                const w = {
                    set damage(v) {
                        damage.visual.text = `${v}%`
                        damage.visual.x = 60
                    },
                }

                Object.assign(w, IContainer(0, 0))
                w.visual.addChild(damage.visual)
                w.visual.addChild(icon.visual)

                return w
            }
        }
        return self
    }
}