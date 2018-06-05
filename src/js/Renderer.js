import {debugManager} from "./debugManager";

export const RENDER_LAYER = {BACKGROUND: 'BACKGROUND', GAME: 'GAME', UI: 'UI'}

export const Renderer = () => {
    let dMenuVisible = false

    let vSize = {x: 800, y: 1280}
    let adjustedVSize = {x: 0, y: 0}
    let canvasW = 0, canvasH = 0

    const supposedAspectRatio = vSize.x / vSize.y

    const stage = new PIXI.Container()
    const layers = {}
    Object.keys(RENDER_LAYER).forEach(layer => {
        layers[layer] = new PIXI.Container()
        stage.addChild(layers[layer])
    })

    const canvas = document.getElementById('gameCanvas')
    const renderer = PIXI.autoDetectRenderer({
        roundPixels: true,
        width: vSize.x,
        height: vSize.y,
        view: canvas,
        backgroundColor: 0xCCCCCC,
        antialias: false,
        resolution: 1,
        forceFXAA: false,
        // autoResize: true
    })

    const resizeCanvas = () => {
        dMenuVisible = debugManager.menu.visible
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        const currentAspectRatio = canvasW / canvasH
        console.log(`real ar: ${currentAspectRatio}, supposed ar: ${supposedAspectRatio}`)
        if (currentAspectRatio > supposedAspectRatio) {
            //
            // wide screen
            const adjustedW = Math.round(vSize.x * (canvasH / vSize.y))
            const marginH = dMenuVisible ? 0 : (canvasW - adjustedW) / 2
            renderer.resize(canvasW, canvasH)

            stage.scale.x = adjustedW / vSize.x
            stage.scale.y = renderer.height / vSize.y
            stage.x = marginH
            stage.y = 0
            adjustedVSize.x = Math.round(vSize.x * (canvasW / adjustedW))
            adjustedVSize.y = vSize.y
        } else {
            //
            // tall screen
            renderer.resize(canvasW, canvasH)

            stage.scale.x = stage.scale.y = canvasW / vSize.x
            stage.x = stage.y = 0
            adjustedVSize.x = vSize.x
            adjustedVSize.y = Math.round(vSize.x / currentAspectRatio)
        }
    }
    resizeCanvas()

    // debug.on('visibility', _ => resizeCanvas())

    const self =  {
        get dom() { return canvas },
        get size() { return adjustedVSize },
        get vSize() { return vSize },
        get stage() { return stage },
        addObject: (go) => {
            if (!go.hasVisual) return console.error(`object ${go} cannot be added for render`)
            const parent = layers[go.layer]
            if (parent) {
                parent.addChild(go.visual)
            } else {
                stage.addChild(go.visual)
            }
        },
        removeObject: go => {
            if (!go.hasVisual) return console.error(`object ${go} cannot be removed from render`)
            const parent = layers[go.layer]
            if (parent) {
                parent.removeChild(go.visual)
            } else {
                stage.removeChild(go.visual)
            }
        },
        update: dt => {
            const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
            const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
            if (newCanvasW !== canvasW || newCanvasH !== canvasH) {
                resizeCanvas()
            }
            renderer.render(stage)
        }
    }

    return self
}