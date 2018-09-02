import {IVisual} from "../behaviours/Base";

export const FlashAnimationVisual2 = (descriptor, level, x, y) => {

    const animation = window.resources.getJSON(descriptor)

    console.log('getting level')
    const self = IVisual(`numbers_roman_${level}`).setAnchor(0, 0).setScale(0.33, 0.33)//.setAnchor(0.555, 0.503)

    const getMatrix = (transform, descriptor) => {
        const a = descriptor.a ? Number.parseFloat(descriptor.a) * -0.33 : transform.a
        const b = descriptor.b ? Number.parseFloat(descriptor.b) : transform.b
        const c = descriptor.c ? Number.parseFloat(descriptor.c) : transform.c
        const d = descriptor.d ? Number.parseFloat(descriptor.d) * 0.33 : transform.d
        const tx = descriptor.tx ? Number.parseFloat(descriptor.tx) * -0.33: transform.tx
        const ty = descriptor.ty ? Number.parseFloat(descriptor.ty) * 0.33 : transform.ty

        return new PIXI.Matrix(a, b, c, d, tx, ty)
    }

    self.applyFrame = frame => {
        const descriptorMatrix = animation[0].frames[frame]
        self.visual.transform.setFromMatrix(getMatrix(self.visual.localTransform, descriptorMatrix))
    }

    self.applyFrame(0)

    return self
}