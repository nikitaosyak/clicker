import {RENDER_LAYER} from "../Renderer";
import {IContainer, IVisual} from "../behaviours/Base";
import {UIFactory} from "./UIFactory";
import {INamedUIElement} from "../behaviours/Base";
import {MathUtil} from "../utils/MathUtil";
import {IAdoptable} from "../behaviours/IAdoptable";

export const GoldCounter = (pivotRules, initialValue) => {

    const counter = UIFactory.forParent('gold_counter')
        .getText('0', -50, 0, {fontSize: 60, fill: '#ffd700'}, {x: 0.5, y: 0.5})
    const icon = IVisual('ui_coin').setSize(80, 80).setLayer(RENDER_LAYER.UI)

    let cachedSize = 0
    const layoutProperly = () => {
        const newSize = counter.visual.width + 10 + icon.visual.width
        if (newSize === cachedSize) return

        cachedSize = newSize
        const middle = Math.floor(newSize/2)
        counter.visual.x = -middle + Math.floor(counter.visual.width/2)
        icon.visual.x = counter.visual.x + Math.floor(counter.visual.width/2) + 10 + Math.round(icon.visual.width/2)
    }

    const animationTarget = {value: initialValue}
    let animation = TweenLite.to(animationTarget, 1, {
        value: initialValue,
        roundProps: 'value',
        ease:Linear.easeNone,
        onUpdate:() => {
            counter.visual.text = MathUtil.convert(animationTarget.value)
            layoutProperly()
        }
    })

    const self = {
        setValue: (newValue) => {
            animation.target = animationTarget
            animation.vars.value = newValue
            animation.invalidate()
            animation.restart()
        },
        setValueInstantly: (newValue) => {
            counter.visual.text = MathUtil.convert(newValue)
            animationTarget.value = newValue
            animation.vars.value = newValue
            layoutProperly()
        }
    }
    Object.assign(self, INamedUIElement('game', 'gold_counter'))
    Object.assign(self, IContainer().setLayer(RENDER_LAYER.UI))
    Object.assign(self, IAdoptable(self.visual, pivotRules, null))
    self.add(counter)
    self.add(icon)

    return self
}