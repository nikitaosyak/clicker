import {debugManager} from "./debugManager";

export const RENDER_LAYER = {BACKGROUND: 'BACKGROUND', GAME: 'GAME', UI: 'UI'}

export const Renderer = () => {
    let dMenuVisible = false

    let vSize = {x: 800, y: 1280}
    let adjustedVSize = {x: 0, y: 0}
    let canvasW = 0, canvasH = 0

    const stage = new PIXI.Container()
    const layers = {}
    Object.keys(RENDER_LAYER).forEach(layer => {
        layers[layer] = new PIXI.Container()
        stage.addChild(layers[layer])
    })

    const canvas = document.getElementById('gameCanvas')
    const renderer = PIXI.autoDetectRenderer({
        roundPixels: false,
        width: vSize.x,
        height: vSize.y,
        view: canvas,
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

        console.log(`real ar: ${canvasW / canvasH}, supposed ar: ${vSize.x / vSize.y}`)
        if (canvasW / canvasH > vSize.x / vSize.y) {
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
            const adjustedH = Math.round(vSize.y * (canvasW / vSize.x))
            const marginV = dMenuVisible ? 0 : (canvasH - adjustedH) / 2
            renderer.resize(canvasW, canvasH)

            stage.scale.x = renderer.width / vSize.x
            stage.scale.y = adjustedH / vSize.y
            stage.x = 0
            stage.y = marginV
            adjustedVSize.x = vSize.x
            adjustedVSize.y = Math.round(vSize.y * (canvasH / adjustedH))
        }
    }
    resizeCanvas()

    // debug.on('visibility', _ => resizeCanvas())

    const _shared = []

    const self =  {
        get dom() { return canvas },
        get size() { return adjustedVSize },
        get vSize() { return vSize },
        get stage() { return stage },
        get shared() { return _shared },
        addShared: go => {
            console.log('adding shared object', go)
            _shared.push(go)
            self.addObject(go)
        },
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
            _shared.forEach(sh => sh.update(dt))
            renderer.render(stage)
        }
    }

    return self
}