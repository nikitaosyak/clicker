import {StaticImage} from "../go/StaticImage";
import {RENDER_LAYER} from "../../Renderer";
import {IContainer} from "../go/GameObjectBase";
import {UIFactory} from "./UIFactory";
import {INamedUIElement} from "./UIElementBase";

export const GoldCounter = (x, y, initialValue) => {

    const counter = UIFactory.forParent('gold_counter')
        .getText('0', -50, 0, {fontSize: 60, fill: '#ffd700'}, {x: 1, y: 0.5})

    const animationTarget = {value: 0}
    let animation = TweenLite.to(animationTarget, 1, {
        value: initialValue,
        roundProps: 'value',
        ease:Linear.easeNone,
        onUpdate:() => {
            counter.visual.text = animationTarget.value
        }
    })

    const self = {
        setValue(newValue) {
            animation.target = animationTarget
            animation.vars.value = newValue
            animation.invalidate()
            animation.restart()
        }
    }
    Object.assign(self, INamedUIElement('game', 'gold_counter'))
    Object.assign(self, IContainer(x, y, RENDER_LAYER.UI))
    self.add(counter)
    self.add(StaticImage('ui_coin', 0, 0, 80, 80, RENDER_LAYER.UI))

    return self
}