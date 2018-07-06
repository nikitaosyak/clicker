import {IAdoptable} from "./behaviours/IAdoptable";
import {RENDER_LAYER} from "./Renderer";
import {IVisual} from "./behaviours/Base";

const ANIMATION_LENGTH = 0.8
const EASING = Elastic.easeOut.config(0.9, 0.95)

export const Background = (renderer) => {

    const layers = []

    for (let i = 1; i <= 6; i++) {
        const layer = IVisual(`background_layer${i}`).setSize(2048, 858).setPosition(0, 0).setLayer(RENDER_LAYER.BACKGROUND)
        const adoptableComponent = IAdoptable(layer.visual, {x: 'center', y: 'middle'})
        Object.assign(layer, {
            adopt: (currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr) => {
                layer.visual.height = renderer.size.y
                layer.visual.scale.x = layer.visual.scale.y
                adoptableComponent.adopt(currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr)
            }
        })
        layers.push(layer.visual)
        renderer.addObject(layer)
    }

    return {
        animateToPosition: p => {
            let animateTo = [0, 0, 0, 0, 0, 0]
            // let pivot = [{x: 0, y: 0.5}, {x: 0.5, y: 0.5}, {x: 1, y: 0.5}]
            switch (p) {
                case 0:
                    const posRight = renderer.size.x/2 + renderer.size.x
                    animateTo = [posRight * 0.5, posRight * 0.6, posRight * 0.7, posRight * 0.8, posRight * 0.9, posRight]
                    break
                case 1:
                    const middle = renderer.size.x/2
                    animateTo = [middle, middle, middle, middle, middle, middle]
                    break
                case 2:
                    break
            }
            layers.forEach((l, i) => {
                TweenLite.to(l, ANIMATION_LENGTH, {pixi: {x: animateTo[i]}, ease: EASING, roundProps: 'x'})
            })
        }
    }
}