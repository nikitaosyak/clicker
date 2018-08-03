import {IContainer, IVisual} from "../behaviours/Base";
import {IAdoptable} from "../behaviours/IAdoptable";
import {RENDER_LAYER} from "../Renderer";

const pivotRules = [
    {x: 'left', xOffset: 120, y: 'bottom', yOffset: 270},
    {x: 'center', xOffset: -14, y: 'bottom', yOffset: 295},
    {x: 'right', xOffset: 140, y: 'bottom', yOffset: 320}
]

export const SlotItemHpBar = (slot, width, height) => {

    const self = {}

    Object.assign(self, IContainer().setLayer(RENDER_LAYER.UI))
    Object.assign(self, IAdoptable(self.visual, pivotRules[slot]))

    const background = IVisual('pixel').setSize(width, height).setAnchor(0.5, 0.5).setTint(0x666666).setAlpha(0.85)
    self.visual.addChild(background.visual)

    const mainHp = IVisual('pixel').setSize(width - 4, height - 4).setAnchor(0, 0.5).setTint(0xAA0000).setAlpha(0.9)
    self.visual.addChild(mainHp.visual)
    mainHp.visual.x = -mainHp.visual.width/2

    const drainedHp = IVisual('pixel').setSize(0, height-4).setAnchor(0, 0.5).setTint(0xAACC00).setAlpha(0.9)
    self.visual.addChild(drainedHp.visual)

    const drainAnimation = TweenLite.to(drainedHp.visual, 0.3, {width: 0, delay: 0.5})
    drainAnimation.pause()

    const maxWidth = width - 4
    let lastValue = -1

    self.setHealthBarValue = (v) => {
        mainHp.visual.width = Math.max(0, maxWidth * v)

        const diff = lastValue - v
        lastValue = v

        drainedHp.visual.x = mainHp.visual.x + mainHp.visual.width
        drainedHp.visual.width += maxWidth * diff
        drainAnimation.invalidate().restart(true)
    }

    self.resetHealthBarValue = () => {
        mainHp.visual.width = width - 4
        drainedHp.visual.width = 0
        drainAnimation.invalidate()

        lastValue = 1
    }

    return self
}