export const debugManager = {
    _fps: new Stats(),
    init: () => {
        debugManager._fps.showPanel(0)
        document.body.appendChild(debugManager._fps.dom)
    },
    frameStarted: () => {
        debugManager._fps.begin()
    },
    frameEnded: () => {
        debugManager._fps.end()
    },
    menu: {
        get visible() { return false }
    }
}