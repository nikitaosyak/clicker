
const ANIMATION_LENGTH = 0.8
const EASING = Elastic.easeOut.config(0.9, 0.95)

export class BaseScreen {

    constructor(owner, type) {
        this._owner = owner
        this._type = type

        this._active = false
        this._content = []
        this._controls = []
        this._originalLocationData = {}
    }

    get type() { return this._type }
    get _renderer() { return this._owner.renderer }

    animateHide(to, onComplete) {
        console.log(this._content)
        this._content.forEach((c, i) => {
            TweenLite.to(c.visual, ANIMATION_LENGTH, {
                pixi: {x: c.visual.x + to.x},
                ease: EASING,
                roundProps:"x",
                onComplete: i === 0 ? onComplete : undefined
            })
        })
    }

    animateShow(from, onComplete) {
        this.show()
        this._content.forEach((c, i) => {
            TweenLite.fromTo(c.visual, ANIMATION_LENGTH,
                {pixi: {x: this._originalLocationData[c.name].x + from.x}},
                {
                    pixi: {x: this._originalLocationData[c.name].x},
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
        if (this._active) {
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