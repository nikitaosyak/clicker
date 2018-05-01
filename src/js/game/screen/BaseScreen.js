
export class BaseScreen {

    constructor(owner, type) {
        this._owner = owner
        this._type = type

        this._active = false
        this._content = []
        this._shared = []
    }

    get type() { return this._type }

    extractShared() {
        return this._shared.splice(0)
    }

    injectShared(shared) {
        this._shared = shared
    }

    add(obj) {
        this._content.push(obj)
        if (this._active) {
            this._owner.renderer.addObject(obj)
        }
    }

    remove(obj) {
        this._content.push(obj)
        if (this._active) {
            this._owner.renderer.removeObject(obj)
        }
    }

    update(dt) { /*virtual method*/ }

    show() {
        console.log(this._content)
        this._active = true
        this._content.forEach(c => {
            this._owner.renderer.addObject(c)
        })
    }

    hide() {
        this._active = false
        this._content.forEach(c => {
            this._owner.renderer.removeObject(c)
        })
    }
}