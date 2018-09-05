import {IContainer, IVisual} from "../../behaviours/Base";

export const Slice9Stupid = (basePath, width, height) => {

    const parent = IContainer()

    const topLeft = IVisual(`${basePath}_top_left`).setAnchor(1, 1)
    const topMiddle = IVisual(`${basePath}_top_middle`).setAnchor(0.5, 1)
    const topRight = IVisual(`${basePath}_top_right`).setAnchor(0, 1)

    const left = IVisual(`${basePath}_left`).setAnchor(1, 0.5)
    const center = IVisual(`${basePath}_middle`).setAnchor(0.5, 0.5)
    const right = IVisual(`${basePath}_right`).setAnchor(0, 0.5)

    const bottomLeft = IVisual(`${basePath}_bottom_left`).setAnchor(1, 0)
    const bottomMiddle = IVisual(`${basePath}_bottom_middle`).setAnchor(0.5, 0)
    const bottomRight = IVisual(`${basePath}_bottom_right`).setAnchor(0, 0)

    const reSize = () => {
        // sizing the 9-slice
        topMiddle.visual.width = center.visual.width = bottomMiddle.visual.width = width - topLeft.visual.width - topRight.visual.width
        center.visual.height = left.visual.height = right.visual.height = height - topLeft.visual.height - bottomLeft.visual.height

        // layouting
        topMiddle.visual.x = 0
        topMiddle.visual.y = -center.visual.height/2
        topLeft.visual.x = -topMiddle.visual.width/2
        topLeft.visual.y = topMiddle.visual.y
        topRight.visual.x = topMiddle.visual.width/2
        topRight.visual.y = topMiddle.visual.y

        left.visual.x = -center.visual.width/2
        right.visual.x = center.visual.width/2

        bottomMiddle.visual.y = center.visual.height/2
        bottomMiddle.visual.y = center.visual.height/2
        bottomLeft.visual.x = -bottomMiddle.visual.width/2
        bottomLeft.visual.y = bottomMiddle.visual.y
        bottomRight.visual.x = bottomMiddle.visual.width/2
        bottomRight.visual.y = bottomMiddle.visual.y
    }

    reSize()
    parent
        .add(topLeft).add(topMiddle).add(topRight)
        .add(left).add(center).add(right)
        .add(bottomLeft).add(bottomMiddle).add(bottomRight)

    parent.setSize = (newW, newH) => {
        width = newW; height = newH
        reSize()
    }

    return parent
}