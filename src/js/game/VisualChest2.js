import {IContainer, IVisual} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const VisualChest2 = (descriptor, baseImagePath, size) => {

    const animation = window.resources.getJSON(descriptor)

    const self = IContainer(100, 100, RENDER_LAYER.GAME)

    const visuals = animation.map(layer => IVisual(`${baseImagePath}_${layer.visual}`).setAnchor(0, 0))
    visuals.forEach(v => {
        self.visual.addChild(v.visual)
    })

    self.visual.hitArea = new PIXI.Rectangle(0, 0, self.visual.width, self.visual.height)
    self.visual.pivot.x = self.visual.width/2
    self.visual.pivot.y = self.visual.height/2
    self.visual.scale.x = self.visual.scale.y = size.w / self.visual.width

    let resolve = null
    let frame = 0
    let currentDt = 0

    const getMatrix = (transform, descriptor) => {
        const a = descriptor.a ? Number.parseFloat(descriptor.a) : transform.a
        const b = descriptor.b ? Number.parseFloat(descriptor.b) : transform.b
        const c = descriptor.c ? Number.parseFloat(descriptor.c) : transform.c
        const d = descriptor.d ? Number.parseFloat(descriptor.d) : transform.d
        const tx = descriptor.tx ? Number.parseFloat(descriptor.tx) : transform.tx
        const ty = descriptor.ty ? Number.parseFloat(descriptor.ty) : transform.ty

        return new PIXI.Matrix(a, b, c, d, tx, ty)
    }

    const applyFrame = frame => {
        animation.forEach((layer, layerIdx) => {
            // console.log(layerIdx, frame, layer.frames[frame])
            const descriptorMatrix = layer.frames[frame]
            const layerVisual = visuals[layerIdx].visual
            if (!descriptorMatrix) {
                layerVisual.visible = false
            } else {
                layerVisual.visible = true
                layerVisual.transform.setFromMatrix(getMatrix(layerVisual.localTransform, descriptorMatrix))
            }
        })
    }

    self.play = () => new Promise(_resolve => resolve = _resolve)

    self.update = dt => {
        if (resolve === null) return

        currentDt += dt
        if (currentDt < 0.05) return
        currentDt = 0

        applyFrame(frame)
        frame += 1
        if (frame === 5) {
            resolve()
        }
        if (frame >= 14) {
            resolve = null
        }
    }

    applyFrame(0)

    return self
}