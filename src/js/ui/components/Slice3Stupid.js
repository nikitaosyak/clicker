import {IContainer, IVisual} from "../../behaviours/Base";

export const Slice3Stupid = (basePath, width, height) => {

    const parent = IContainer()

    const left = IVisual(`${basePath}_left`).setAnchor(1, 0.5)
    const center = IVisual(`${basePath}_middle`).setAnchor(0.5, 0.5)
    const right = IVisual(`${basePath}_right`).setAnchor(0, 0.5)

    const reSize = () => {
        // sizing the 3-slice
        const cornerRatio = left.visual.width/left.visual.height
        left.visual.height = right.visual.height = height
        left.visual.width = right.visual.width = cornerRatio*left.visual.height

        center.visual.height = height
        center.visual.width = width - left.visual.width*2

        // layouting
        center.visual.x = 0
        left.visual.x = -center.visual.width/2
        right.visual.x = center.visual.width/2
    }

    reSize()
    parent.add(left).add(center).add(right)

    parent.setTint = v => {
        left.setTint(v)
        center.setTint(v)
        right.setTint(v)
    }

    return parent
}