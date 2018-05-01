import {RENDER_LAYER} from "../../Renderer";

export const TOGGLE_STATE = {NORMAL: 'NORMAL', TOGGLED: 'TOGGLED'}

let INSTANCE_COUNTER = 0

export const INamedUIElement = (screen, type) => {
    return {get name() {return `${type}_${screen}_${INSTANCE_COUNTER++}`}}
}

export const IToggleButton = (onToggle, normalState, toggledState, x, y, w, h) => {

    let currentState = TOGGLE_STATE.NORMAL
    const button = ISimpleButton(() => {
        if (currentState === TOGGLE_STATE.NORMAL) {
            currentState = TOGGLE_STATE.TOGGLED
            button.visual.texture = window.resources.getTexture(toggledState)
        } else {
            currentState = TOGGLE_STATE.NORMAL
            button.visual.texture = window.resources.getTexture(normalState)
        }
        onToggle(currentState)
    }, normalState, x, y, w, h)

    return button
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