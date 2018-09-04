import {IVisual} from "../behaviours/Base";

export const FlashAnimationVisual2 = (descriptor, level, tier) => {

    const animation = window.resources.getJSON(descriptor)

    const scaleFix = [-1, 0.5, 0.4, 0.4, 0.4, 0.4, 0.33][tier]

    const self = IVisual(`numbers_roman_${level}`).setAnchor(0, 0)//.setScale(0.5, 0.5)//.setAnchor(0.555, 0.503)

    const getMatrix = (transform, descriptor) => {
        const a = descriptor.a ? Number.parseFloat(descriptor.a) * scaleFix : transform.a
        const b = descriptor.b ? Number.parseFloat(descriptor.b) * scaleFix : transform.b
        const c = descriptor.c ? Number.parseFloat(descriptor.c) * scaleFix : transform.c
        const d = descriptor.d ? Number.parseFloat(descriptor.d) * scaleFix : transform.d
        const tx = descriptor.tx ? Number.parseFloat(descriptor.tx) * scaleFix: transform.tx
        const ty = descriptor.ty ? Number.parseFloat(descriptor.ty) * scaleFix : transform.ty

        return new PIXI.Matrix(a, b, c, d, tx, ty)
    }

    self.applyFrame = frame => {
        const descriptorMatrix = animation[0].frames[frame]
        self.visual.transform.setFromMatrix(getMatrix(self.visual.localTransform, descriptorMatrix))
    }

    self.updateLevel = value => {
        self.setTexture(`numbers_roman_${value}`)
    }

    self.applyFrame(0)

    return self
}