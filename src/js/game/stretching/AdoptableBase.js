import {RENDER_LAYER} from "../../Renderer";
import {MathUtil} from "../../utils/MathUtil";

export const IAdoptableBase = (visual, pivotRules, stretchRules = null) => {
    return {
        adopt: (currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr) => {

            if (stretchRules !== null) {
                if (currentAr > virtualAr) {    // wide screen
                    visual.width = canvasSize.x
                    // noinspection JSSuspiciousNameCombination
                    visual.scale.y = visual.scale.x
                } else {                        // tall screen
                    visual.height = canvasSize.y
                    // noinspection JSSuspiciousNameCombination
                    visual.scale.x = visual.scale.y
                }
            }

            if (pivotRules !== null) {
                const xPivot = pivotRules.x
                let xOffset = typeof pivotRules.xOffset === 'undefined' ? 0 : pivotRules.xOffset
                const xOffsetMin = typeof pivotRules.xOffsetMin === 'undefined' ? xOffset : pivotRules.xOffsetMin
                const xOffsetMax = typeof pivotRules.xOffsetMax === 'undefined' ? xOffsetMin : pivotRules.xOffsetMax
                xOffset = MathUtil.lerp(xOffsetMin, xOffsetMax, Math.max(0, (virtualCanvasSize.y*currentAr - virtualCanvasSize.x)) / (virtualCanvasSize.y*maxAr - virtualCanvasSize.x))
                if (typeof xPivot === 'string') {
                    if (xPivot === 'center') {
                        visual.x = canvasSize.x/2
                        visual.x += xOffset
                    }
                    if (xPivot === 'left') {
                        visual.x = 0
                        visual.x += xOffset
                    }
                    if (xPivot === 'right') {
                        visual.x = canvasSize.x
                        visual.x -= xOffset
                    }
                }

                const yPivot = pivotRules.y
                const yOffset = typeof pivotRules.yOffset === 'undefined' ? 0 : pivotRules.yOffset
                if (typeof  yPivot === 'string') {
                    if (yPivot === 'middle') {
                        visual.y = canvasSize.y/2
                        visual.y += yOffset
                    }
                    if (yPivot === 'top') {
                        visual.y = 0
                        visual.y += yOffset
                    }
                    if (yPivot === 'bottom') {
                        visual.y = canvasSize.y
                        visual.y -= yOffset
                    }
                }
            }

        }
    }
}

export const IAdoptableVisual = (t, size, anchor, layer) => {
    const s = new PIXI.Sprite(window.resources.getTexture(t))
    s.width = size.x; s.height = size.y
    s.anchor.x = anchor.x; s.anchor.y = anchor.y

    return {
        get layer() { return layer || RENDER_LAYER.GAME },
        get hasVisual() { return true },
        get visual() { return s }
    }
}

export const IAdoptableButton = (onClick, t, size, anchor) => {
    const s = new PIXI.Sprite(window.resources.getTexture(t))
    s.width = size.x; s.height = size.y
    s.anchor.x = anchor.x; s.anchor.y = anchor.y
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

export const TOGGLE_STATE = {NORMAL: 'NORMAL', TOGGLED: 'TOGGLED'}
export const IAdoptableToggleButton = (onToggle, normalState, toggledState, size, anchor) => {

    let currentState = TOGGLE_STATE.NORMAL
    const button = IAdoptableButton(() => {
        if (currentState === TOGGLE_STATE.NORMAL) {
            currentState = TOGGLE_STATE.TOGGLED
            button.visual.texture = window.resources.getTexture(toggledState)
        } else {
            currentState = TOGGLE_STATE.NORMAL
            button.visual.texture = window.resources.getTexture(normalState)
        }
        onToggle(currentState)
    }, normalState, size, anchor)

    return button
}