
const ANIMATION_LENGTH = 0.8
const EASING = Elastic.easeOut.config(0.9, 0.95)

export class BaseScreen {

    constructor(owner, type) {
        this._owner = owner
        this._type = type

        this._active = false
        this._hiding = false
        this._content = []
        this._controls = []
        this._originalLocationData = {}
        this._cachedViewportSize = {x: 0, y: 0, equal(vpSize){ return this.x === vpSize.x && this.y === vpSize.y }}
    }

    get type() { return this._type }
    get _renderer() { return this._owner.renderer }

    animateHide(to, onComplete) {
        const self = this
        this._hiding = true
        this._content.forEach((c, i) => {
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
            let animateFrom = this._originalLocationData[c.name].x + from.x
            let animateTo = this._originalLocationData[c.name].x
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
        this._content.push(obj)
        this._originalLocationData[obj.name] = {
            x: obj.visual.x,
            y: obj.visual.y
        }
        if (this._active && !this._hiding) {
            this._renderer.addObject(obj)
        }
    }

    remove(obj) {
        this._content.splice(this._content.indexOf(obj), 1)
        delete this._originalLocationData[obj.name]
        if (this._active) {
            this._renderer.removeObject(obj)
        }
    }

    update(dt) { /*virtual method*/ }

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