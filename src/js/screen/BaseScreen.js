
const ANIMATION_LENGTH = 0.7
const EASING = Elastic.easeOut.config(0.98, 0.98)

export class BaseScreen {

    constructor(owner, type) {
        this._owner = owner
        this._type = type

        this._active = false
        this._hiding = false
        this._content = []
        this._controls = []
        this._cachedViewportSize = {x: 0, y: 0, equal(vpSize){ return this.x === vpSize.x && this.y === vpSize.y }}
    }

    get type() { return this._type }
    get _renderer() { return this._owner.renderer }
    get active() { return this._active }

    animateHide(to, onComplete) {
        const self = this
        this._hiding = true

        let i = this._content.length-1
        while (i >= 0) {
            if (typeof this._content[i].unimportantContent !== 'undefined') {
                this.remove(this._content[i])
            }
            i -= 1
        }

        this._content.forEach((c, i) => { // todo: pool this tweens
            TweenLite.to(c.visual, ANIMATION_LENGTH, {
                pixi: {x: c.visual.x + to.x},
                ease: EASING,
                roundProps:"x",
                onComplete: i === 0 ? () => {
                    self._hiding = false
                    onComplete()
                } : undefined
            })
        })
    }

    animateShow(from, onComplete) {
        this.show()
        this._content.forEach((c, i) => {
            let animateFrom = c._originalLocationData.x + from.x
            let animateTo = c._originalLocationData.x
            if (typeof c.adopt !== 'undefined') {
                animateFrom = c.visual.x + from.x
                animateTo = c.visual.x
            }
            TweenLite.fromTo(c.visual, ANIMATION_LENGTH,
                {pixi: {x: animateFrom}},
                {
                    pixi: {x: animateTo},
                    ease: EASING,
                    roundProps:"x",
                    onComplete: i === 0 ? onComplete : undefined
                })
        })
    }

    enableControls() {
        this._controls.forEach(c => c.interactive = true)
    }

    disableControls() {
        this._controls.forEach(c => c.interactive = false)
    }

    addControl(obj) {
        this._controls.push(obj)
        this.add(obj)
    }

    removeControl(obj) {
        this._controls.splice(this._controls.indexOf(obj))
        this.remove(obj)
    }

    add(obj) {
        if (!this._active && obj.unimportantContent) return
        if (this._hiding && obj.unimportantContent) return

        this._content.push(obj)
        obj._originalLocationData = {x: obj.visual.x, y: obj.visual.y}
        if (this._active && !this._hiding) {
            this._renderer.addObject(obj)
        }
    }

    remove(obj) {
        const index = this._content.indexOf(obj)
        if (index < 0) return
        this._content.splice(index, 1)
        delete obj._originalLocationData
        if (this._active) {
            this._renderer.removeObject(obj)
        }
    }

    update(dt) {
        if (!this._cachedViewportSize.equal(this._owner.renderer.size)) {
            this._cachedViewportSize.x = this._owner.renderer.size.x
            this._cachedViewportSize.y = this._owner.renderer.size.y
            this.onViewportSizeChanged()
        }
    }

    onViewportSizeChanged() { /*virtual method*/ }

    show() {
        this._active = true
        this._content.forEach(c => {
            this._renderer.addObject(c)
        })
    }

    hide() {
        this._active = false
        this._content.forEach(c => {
            this._renderer.removeObject(c)
        })
    }
}