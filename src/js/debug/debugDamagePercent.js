import {IText} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const DamagePercent = (pool, onComplete) => {

    let animation = null
    const self = {
        initialize: (text, x, y) => {

            self.visual.text = text
            self.visual.x = x
            self.visual.y = y
            self.visual.alpha = 1

            animation.vars.y = y-300
            animation.vars.alpha = 0.6
            animation.restart(false, false)
        }
    }
    Object.assign(self, IText('', 0, 0, {fontSize: 60, fill: '#CCCCCC'}, 0.5, 0.5, RENDER_LAYER.UI))
    animation = TweenLite.to(
        self.visual, 2.5,
        {alpha: 0, y: 0, roundProps: 'y', ease: Linear.easeNone, onComplete: () => {
                onComplete(self)
                pool.putOne(self)
            }})
    animation.pause()

    return self
}