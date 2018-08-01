import {INamedUIElement} from "../behaviours/Base";
import {IAnimated, IButton, IContainer, IText, IToggleButton, IVisual} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";
import {IAdoptable} from "../behaviours/IAdoptable";
import {MathUtil} from "../utils/MathUtil";

const BUTTON_WIDTH = 90
const BUTTON_HEIGHT = 90

export const UIFactory = {
    forParent: parent => {
        const self = {
            getFullScreenButton: (fsElement, anchor, pivotRules) => {
                if (typeof document.fullscreenEnabled !== undefined &&
                    window.config.PLATFORM === 'standalone') {
                    const button = {}
                    Object.assign(button, INamedUIElement(parent, 'full_screen'))
                    Object.assign(button, IToggleButton(
                        'ui_fullscreen_to',
                        'ui_fullscreen_from',
                            check => {
                                if (check) {
                                    fsElement.requestFullscreen()
                                } else {
                                    document.exitFullscreen()
                                }
                            }).setSize(BUTTON_WIDTH, BUTTON_HEIGHT).setAnchor(anchor.x, anchor.y)
                    )
                    Object.assign(button, IAdoptable(button.visual, pivotRules, null))
                    return button
                }
                return null
            },

            getButton: (texture, x, y, onClick, sizeX = undefined, sizeY = undefined) => {
                const button = {}
                Object.assign(button, INamedUIElement(parent, `button`))
                Object.assign(button,
                    IButton(texture, onClick)
                        .setPosition(x, y)
                        .setSize(sizeX || BUTTON_WIDTH, sizeY || BUTTON_HEIGHT)
                )
                return button
            },

            getButton2: (texture, onClick, anchor, pivotRules, name = 'button') => {
                const button = {}
                Object.assign(button, INamedUIElement(parent, name))
                Object.assign(button,
                    IButton(texture, onClick)
                        .setSize(BUTTON_WIDTH, BUTTON_HEIGHT)
                        .setAnchor(anchor.x, anchor.y)
                )
                Object.assign(button, IAdoptable(button.visual, pivotRules, null))
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
                Object.assign(pc, IContainer().setPosition(x, y).setLayer(RENDER_LAYER.UI))
                return pc
            },

            getCoinParticle: (x, y) => {
                const c = {}
                Object.assign(c, INamedUIElement(parent, 'coinParticle'))
                Object.assign(c,
                    IAnimated('anim_coin')
                        .setSize(60, 60)
                        .setPosition(x, y)
                        .setAnimationSpeed(0.7)
                        .setLayer(RENDER_LAYER.UI)
                )
                return c
            },

            getLevelIndicatorWidget: () => {
                const background = IVisual('ui_white_circle').setSize(80, 80)
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
                const icon = IVisual('ui_upgrade_dragon').setPosition(0, 4).setSize(80, 80).setAnchor(0, 0.5)
                icon.interactive = false
                btn.visual.addChild(icon.visual)

                const price = UIFactory.forParent('upgrade_button').getText('', 0, 0, {
                    fontSize: 30, fill: '#000000'
                }, {x: 0, y: 0.5})
                price.interactive = false
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

                const icon = IVisual('ui_attack').setSize(80, 80).setAnchor(1, 0.5).setLayer(RENDER_LAYER.UI)
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

                Object.assign(w, IContainer())
                w.visual.addChild(damage.visual)
                w.visual.addChild(icon.visual)

                return w
            },

            getCheckboxTextWidget: (pos, tex1, tex2, onClick, buttonSize, textStyle) => {
                const container = IContainer().setPosition(pos.x, pos.y)
                const button = IToggleButton(tex1, tex2, onClick)
                    .setAnchor(1, 0.5)
                    .setSize(buttonSize.x, buttonSize.y)
                const text = IText('something', 10, 0, textStyle, 0, 0.5)
                container.visual.addChild(button.visual)
                container.visual.addChild(text.visual)

                return {
                    visual: container.visual,
                    button: button,
                    text: text
                }
            }
        }
        return self
    }
}