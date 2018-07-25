import {IVisual} from "../behaviours/Base";

export const FlashAnimationVisual2 = (descriptor, level) => {

    const animation = window.resources.getJSON(descriptor)

    const self = IVisual(`numbers_roman_${level}`).setAnchor(0.555, 0.503)
    self.interactive = true

    const getMatrix = (transform, descriptor) => {
        const a = descriptor.a ? Number.parseFloat(descriptor.a) : transform.a
        const b = descriptor.b ? Number.parseFloat(descriptor.b) : transform.b
        const c = descriptor.c ? Number.parseFloat(descriptor.c) : transform.c
        const d = descriptor.d ? Number.parseFloat(descriptor.d) : transform.d
        const tx = descriptor.tx ? Number.parseFloat(descriptor.tx) : transform.tx
        const ty = descriptor.ty ? Number.parseFloat(descriptor.ty) : transform.ty

        return new PIXI.Matrix(a, b, c, d, tx, ty)
    }

    self.applyFrame = frame => {
        const descriptorMatrix = animation[0].frames[frame]
        self.visual.transform.setFromMatrix(getMatrix(self.visual.localTransform, descriptorMatrix))
    }

    self.applyFrame(0)

    return self
}