
export const DestroyAnimation = pool => {

    let onComplete = null
    const animation = TweenLite.to(
        {}, 1, {ease: Linear.easeNone, onComplete: () => {
                pool.putOne(self)
                onComplete()
            }})
    animation.pause()
    const self = {
        initialize: (target, time, delay, _onComplete) => {
            onComplete = _onComplete

            animation.target = target
            animation.vars.pixi = {
                delay: delay,
                y: target.y + target.height,
				scaleX: target.scale.x * 1.5,
                scaleY: target.scale.y * 1.5,
                alpha: 0.5,
                //hue: 180,
            }
            animation.duration(time)
                .delay(delay)
                .invalidate()
                .restart(true, false)
        }
    }
    return self
}