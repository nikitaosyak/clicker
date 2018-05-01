import {RENDER_LAYER} from "../../Renderer";

export const TOGGLE_STATE = {NORMAL: 'NORMAL', TOGGLED: 'TOGGLED'}

export const IToggleButton = (onToggle, normalState, toggledState, x, y, w, h) => {
    const s = new PIXI.Sprite(window.resources.getTexture(normalState))
    s.width = w; s.height = h
    s.x = x; s.y = y
    s.anchor.x = s.anchor.y = 0.5
    s.interactive = true

    let currentState = TOGGLE_STATE.NORMAL

    const onClick = () => {
        if (currentState === TOGGLE_STATE.NORMAL) {
            currentState = TOGGLE_STATE.TOGGLED
            s.texture = window.resources.getTexture(toggledState)
        } else {
            currentState = TOGGLE_STATE.NORMAL
            s.texture = window.resources.getTexture(normalState)
        }
        onToggle(currentState)
    }

    s.on('click', onClick); s.on('tap', onClick)

    return {
        get layer() { return RENDER_LAYER.UI },
        get hasVisual() { return true },
        get visual() { return s }
    }
}