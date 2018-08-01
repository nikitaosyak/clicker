import {IContainer, IVisual} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const VisualChest = () => {

    const self = IContainer().setLayer(RENDER_LAYER.GAME)

    const SX = 0.454 * 0.87, SY = 0.4701 * 0.87
    const top = IVisual('chest_top').setAnchor(0, 0).setPosition(44.7, 58.6).setScale(SX, SY)
    const base = IVisual('chest_base').setAnchor(0, 0).setPosition(50, 104).setScale(SX, SY)
    const topBehind = IVisual('chest_top_behind').setAnchor(0, 0.3).setPosition(18.9, 51.8).setScale(SX, SY)

    self.visual.addChild(topBehind.visual)
    self.visual.addChild(base.visual)
    self.visual.addChild(top.visual)

    self.visual.hitArea = new PIXI.Rectangle(0, 0, self.visual.width, self.visual.height)
    self.visual.pivot.x = self.visual.width/2 + 25
    self.visual.pivot.y = self.visual.height/2 + 40
    topBehind.visual.visible = false


    let resolve = null
    let frame = 0
    let currentDt = 0
    self.play = () => {
        return new Promise(_resolve => {
            resolve = _resolve
        })
    }
    self.update = (dt) => {
        if (resolve === null) return

        currentDt += dt
        if (currentDt < 0.04) return
        currentDt = 0


        const tlt = top.visual.localTransform
        const blt = base.visual.localTransform
        const tblt = topBehind.visual.localTransform

        if (frame === 0) {
            top.visual.visible = true
            top.visual.transform.setFromMatrix(new PIXI.Matrix(tlt.a, tlt.b, tlt.c, 0.4701 * 0.9798, 44.7, 58.6))

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX, 0, 0, SY, 50, 104))

            topBehind.visual.visible = false
        } else if (frame === 1) {
            top.visual.transform.setFromMatrix(new PIXI.Matrix(tlt.a, tlt.b, tlt.c, 0.4701 * 0.9885, 44.7, 58.4))
        } else if (frame === 2) {
            top.visual.transform.setFromMatrix(new PIXI.Matrix(tlt.a, tlt.b, tlt.c, 0.4701 *0.9711, 44.7, 58.8))
        } else if (frame === 3) {
            // top.setPivot(116.75, 21.6)
            top.visual.transform.setFromMatrix(new PIXI.Matrix(tlt.a, tlt.b, tlt.c, 0.4701 *0.75, 44.7, 63.55))

            base.visual.transform.setFromMatrix(new PIXI.Matrix(blt.a, blt.b, blt.c, blt.d, 52.9, 103.8))
        } else if (frame === 4) {
            top.visual.visible = false

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9983, -0.0532, 0.0529, SY * 0.9916, 43.55, 112.55))

            topBehind.visual.visible = true
            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, -0.052, SY * 1.458, 18.9, 51.8))
        } else if (frame === 5) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9986, -0.0444, 0.0438, SY * 0.9854, 45.15, 112.45))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, -0.0592, SY * 1.100, 19.2, 72.9))
        } else if (frame === 6) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9990, -0.0356, 0.0352, SY * 0.9857, 46.7, 111.2))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, -0.0587, SY * 0.7802, 19.05, 91.95))
        } else if (frame === 7) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9993, -0.0268, 0.0265, SY * 0.9860, 48.2, 110))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, -0.0130, SY * 0.5598, 16.45, 105.5))
        } else if (frame === 8) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9996, -0.0180, 0.0178, SY * 0.9863, 49.8, 108.75))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.0123, SY * 0.5577, 14.95, 106.75))
        } else if (frame === 9) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9997, -0.0092, 0.0091, SY * 0.9864, 51.75, 108.6))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.0498, SY * 0.6723, 13.1, 103.45))
        } else if (frame === 10) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9997, -0.0054, 0.0053, SY * 0.9864, 52.45, 108.1))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.0680, SY * 0.7798, 12.15, 97.95))
        } else if (frame === 11) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9998, -0.0048, 0.0047, SY * 0.9865, 52.5, 108.5))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.0850, SY * 0.8477, 11.2, 94.65))
        } else if (frame === 12) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9998, -0.0010, 0.0009, SY * 0.9865, 53.2, 107.55))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.1022, SY * 0.9006, 10.25, 92.15))
        } else if (frame === 13) {

            base.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9998, -0.0004, 0.0004, SY * 0.9865, 53.3, 107.45))

            topBehind.visual.transform.setFromMatrix(new PIXI.Matrix(SX * 0.9999, 0.0006, 0.1222, SY * 0.9646, 9.25, 89.05))
        }

        frame += 1
        if (frame === 5) {
            resolve()
        }
        if (frame > 13) {
            resolve = null
        }
    }

    return self
}