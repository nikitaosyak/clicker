import {debugManager} from "./debugManager";

export const Renderer = () => {
    let dMenuVisible = false

    let vSize = {x: 800, y: 1280}
    let adjustedVSize = {x: 0, y: 0}
    let canvasW = 0, canvasH = 0

    const stage = new PIXI.Container()

    const renderer = PIXI.autoDetectRenderer({
        roundPixels: false,
        width: vSize.x,
        height: vSize.y,
        view: document.getElementById('gameCanvas'),
        backgroundColor: 0xCCCCCC,
        antialias: false,
        resolution: 1,
        forceFXAA: false,
        // autoResize: false
    })

    const resizeCanvas = () => {
        dMenuVisible = debugManager.menu.visible
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        if (canvasW / canvasH > vSize.x / vSize.y) {
            const adjustedW = Math.round(vSize.x * (canvasH / vSize.y))
            const marginH = dMenuVisible ? 0 : (canvasW - adjustedW) / 2
            renderer.resize(canvasW, canvasH)
            //
            stage.scale.x = adjustedW / vSize.x
            stage.scale.y = renderer.height / vSize.y
            stage.x = marginH
            adjustedVSize.x = vSize.x
            adjustedVSize.y = vSize.y
        } else {
            const adjustedH = Math.round(vSize.y * (canvasW / vSize.x))
            const marginV = dMenuVisible ? 0 : (canvasH - adjustedH) / 2
            renderer.resize(canvasW, canvasH)
            //
            stage.scale.x = renderer.width / vSize.x
            stage.scale.y = adjustedH / vSize.y
            stage.y = marginV*2
            adjustedVSize.x = vSize.x
            adjustedVSize.y = vSize.y * (canvasH / adjustedH)
        }
        console.log(vSize.x, stage.width)
    }
    resizeCanvas()

    // debug.on('visibility', _ => resizeCanvas())

    return {
        get size() { return adjustedVSize },
        get stage() { return stage },
        addObject: (go) => {
            go.hasVisual && stage.addChild(go.visual)
        },
        removeObject: (go) => {
            go.hasVisual && stage.removeChild(go.visual)
        },
        update: () => {
            const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
            const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
            if (newCanvasW !== canvasW || newCanvasH !== canvasH) {
                resizeCanvas()
            }
            renderer.render(stage)
        }
    }
}