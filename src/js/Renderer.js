import {debugManager} from "./debugManager";

export const RENDER_LAYER = {BACKGROUND: 'BACKGROUND', GAME: 'GAME', UI: 'UI'}

export const Renderer = () => {
    let dMenuVisible = false

    const vSize = {x: 800, y: 1280}
    const maximumWideAR = 0.8
    const adjustedVSize = {x: 0, y: 0}
    let canvasW = 0, canvasH = 0

    const supposedAspectRatio = vSize.x / vSize.y
    let currentAspectRatio = supposedAspectRatio

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

    const resizableObjects = []
    const resizeCanvas = () => {
        dMenuVisible = debugManager.menu.visible
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        currentAspectRatio = canvasW / canvasH
        renderer.resize(canvasW, canvasH)
        console.log(`real ar: ${currentAspectRatio}, supposed ar: ${supposedAspectRatio}`)
        if (currentAspectRatio > supposedAspectRatio) {
            //
            // wide screen
            const actualWidth = Math.ceil(vSize.y * currentAspectRatio)
            stage.scale.x = stage.scale.y = canvasH / vSize.y
            adjustedVSize.x = Math.min(vSize.y * maximumWideAR, actualWidth)
            adjustedVSize.y = vSize.y

            if (canvasW > canvasH * maximumWideAR) {
                stage.x = Math.round((canvasW - (canvasH * maximumWideAR))/2)
            } else {
                stage.x = 0
            }
        } else {
            //
            // tall screen
            stage.scale.x = stage.scale.y = canvasW / vSize.x
            adjustedVSize.x = vSize.x
            adjustedVSize.y = Math.ceil(vSize.x / currentAspectRatio)
        }
        resizableObjects.forEach(o => o.adopt(currentAspectRatio, supposedAspectRatio, adjustedVSize))
    }
    resizeCanvas()

    // debug.on('visibility', _ => resizeCanvas())

    const self =  {
        get dom() { return canvas },
        get size() { return adjustedVSize },
        get vSize() { return vSize },
        get stage() { return stage },
        addResizableObject: (go) => {
            go.adopt(currentAspectRatio, supposedAspectRatio, adjustedVSize)
            resizableObjects.push(go)
            self.addObject(go)
        },
        removeResizableObject: (go) => {
            resizableObjects.splice(resizableObjects.indexOf(go), 1)
            self.removeObject(go)
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
            renderer.render(stage)
        }
    }

    return self
}