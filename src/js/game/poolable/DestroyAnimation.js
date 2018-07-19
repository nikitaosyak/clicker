
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
                scaleX: target.scale.x * 2,
                scaleY: target.scale.y * 2,
                alpha: 0,
                hue: 180,
                rotation: Math.random() > 0.5 ? 120 : -120
            }
            animation.duration(time)
                .delay(delay)
                .invalidate()
                .restart(true, false)
        }
    }
    return self
}