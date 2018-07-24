import {IContainer, IVisual, ObjectType} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const FlashAnimationVisual = (descriptor, baseImagePath, type, slot, crutchStates = []) => {

    crutchStates = crutchStates.map(t => {
        return IVisual(t).setAnchor(0.5, 0.5)
    }).reverse()

    const frameRate = type.indexOf('egg') !== 1 ? 2 : 3
    let scale = 1
    if (type.indexOf('egg') !== -1) {
        scale = 0.51
    } else if (type === ObjectType.CHEST) {
        if (slot === 0) {
            scale = 0.35
        }
        if (slot === 2) {
            scale = 0.42
        }
    } else if (type === ObjectType.PAID_CHEST) {
        scale = 0.42
    }

    const animation = window.resources.getJSON(descriptor)

    const self = IContainer(0, 0, RENDER_LAYER.GAME)

    const visuals = animation.map(layer => IVisual(`${baseImagePath}_${layer.visual}`).setAnchor(0, 0))
    visuals.forEach(v => {
        self.visual.addChild(v.visual)
    })

    self.visual.hitArea = new PIXI.Rectangle(-self.visual.width/2, -self.visual.height/2, self.visual.width, self.visual.height)
    // self.visual.pivot.x = self.visual.width/2
    // self.visual.pivot.y = self.visual.height/2
    self.visual.scale.x = self.visual.scale.y = scale

    let resolve = null
    let frame = 0
    let appFrame = 0

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

    self.setCrutchState = state => {
        const singleState = 1 / (crutchStates.length-1)
        const stateSlot = Math.floor(state / singleState)
        const visualIndexes = [stateSlot, stateSlot+1]
        const lerp1 = (state - singleState * stateSlot)/singleState
        const lerp0 = 1 - lerp1
        // console.log(state, stateSlot, visualIndexes, lerp1, lerp0)

        visuals.forEach(v => v.visual.visible = false)

        crutchStates.forEach(cs => self.visual.removeChild(cs.visual))
        self.visual.addChild(crutchStates[stateSlot].visual)
        crutchStates[stateSlot].visual.alpha = 1
        self.visual.addChild(crutchStates[stateSlot+1].visual)
        crutchStates[stateSlot+1].visual.alpha = lerp1
    }

    self.play = () => {
        crutchStates.forEach(cs => self.visual.removeChild(cs.visual))
        return new Promise(_resolve => resolve = _resolve)
    }

    self.update = () => {
        if (resolve === null) return

        appFrame += 1
        appFrame = appFrame % frameRate
        if (appFrame !== 0) return

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