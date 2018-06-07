import {RENDER_LAYER} from "../../Renderer";


let INSTANCE_COUNTER = 0

export const INamedUIElement = (parent, type) => {
    return {get name() {return `${type}_${parent}_${INSTANCE_COUNTER++}`}}
}

export const ISimpleButton = (onClick, texture, x, y, w, h) => {
    const s = new PIXI.Sprite(window.resources.getTexture(texture))
    s.width = w; s.height = h
    s.x = x; s.y = y
    s.anchor.x = s.anchor.y = 0.5
    s.interactive = true

    s.on('click', onClick); s.on('tap', onClick)

    return {
        get interactive() { return s.interactive },
        set interactive(v) { s.interactive = v },
        get layer() { return RENDER_LAYER.UI },
        get hasVisual() { return true },
        get visual() { return s }
    }
}