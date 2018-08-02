import {IContainer, IVisual, ObjectType} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const FlashAnimationVisual = (descriptor, baseImagePath, stage, type, slot, crutchStates = [], tier = NaN) => {



    const frameRate = type.indexOf('egg') !== 1 ? 2 : 3
    let scale = 1
    let filter = null
    if (type.indexOf('egg') !== -1) {
        scale = 0.51
        if (type === ObjectType.EGG) {
            const gradients = window.resources.getJSON(`${baseImagePath}_gradients`)[`tier${tier}`]
            filter = new PIXI.Filter(null, window.resources.getText('shader_gradient_map'))
            Object.keys(gradients).forEach(gK => {
                filter.uniforms[gK] = gradients[gK].map((g, i) => i < 3 ? g/255 : g)
            })
            // console.log(filter.uniforms)
        }
    } else if (type === ObjectType.CHEST) {
        if (slot === 0) {
            scale = 0.35
        }
        if (slot === 1) {
            scale = 0.37
        }
        if (slot === 2) {
            scale = 0.42
        }
    } else if (type === ObjectType.PAID_CHEST) {
        scale = 0.42
    }

    crutchStates = crutchStates.map(t => IVisual(t).setAnchor(0.5, 0.5)).reverse()

    const animation = window.resources.getJSON(descriptor)

    const root = IContainer().setLayer(RENDER_LAYER.GAME)
    const filteredContainer = IContainer()
    root.visual.addChild(filteredContainer.visual)
    if (filter) {
        filteredContainer.visual.filters = [filter]
    }

    const visuals = animation.map(layer => {
        if (layer.visual === 'NUMBER') {

            const numberVisual = IContainer()
            if (stage < 10) {
                numberVisual.visual.addChild(IVisual(`numbers_arabic_${stage}`)
                    .setAnchor(0, 0)
                    .setTint(0xFF9e48).visual)
            } else {
                const digit1 = IVisual(`numbers_arabic_${Math.floor(stage / 10)}`)
                    .setAnchor(1, 0).setScale(0.7, 0.9).setTint(0xFF9e48)
                const digit0 = IVisual(`numbers_arabic_${stage % 10}`)
                    .setAnchor(0, 0).setScale(0.7, 0.9).setTint(0xFF9e48)
                numberVisual.visual.addChild(digit1.visual)
                numberVisual.visual.addChild(digit0.visual)
                numberVisual.visual.pivot.x = numberVisual.visual.width * -0.25
                // numberVisual.visual.pivot.y = numberVisual.visual.height * anchorY
            }
            return numberVisual
        } else {
            return IVisual(`${baseImagePath}_${layer.visual}`).setAnchor(0, 0)
        }
    })
    visuals.forEach(v => {
        filteredContainer.visual.addChild(v.visual)
    })

    root.visual.hitArea = new PIXI.Rectangle(-root.visual.width/2, -root.visual.height/2, root.visual.width, root.visual.height)
    // self.visual.pivot.x = self.visual.width/2
    // self.visual.pivot.y = self.visual.height/2
    root.visual.scale.x = root.visual.scale.y = scale

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

    root.setCrutchState = state => {
        const singleState = 1 / (crutchStates.length-1)
        const stateSlot = Math.floor(state / singleState)
        const visualIndexes = [stateSlot, stateSlot+1]
        const lerp1 = (state - singleState * stateSlot)/singleState
        const lerp0 = 1 - lerp1
        // console.log(state, stateSlot, visualIndexes, lerp1, lerp0)

        visuals.forEach(v => v.visual.visible = false)

        crutchStates.forEach(cs => root.visual.removeChild(cs.visual))
        filteredContainer.visual.addChild(crutchStates[stateSlot].visual)
        crutchStates[stateSlot].visual.alpha = 1
        filteredContainer.visual.addChild(crutchStates[stateSlot+1].visual)
        crutchStates[stateSlot+1].visual.alpha = lerp1
    }

    root.play = () => {
        crutchStates.forEach(cs => filteredContainer.visual.removeChild(cs.visual))
        return new Promise(_resolve => resolve = _resolve)
    }

    root.update = () => {
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

    return root
}