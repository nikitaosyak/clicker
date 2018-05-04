import {ITypedObject, IVisual, ObjectType} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

export const Dragon = (renderer, tier, level, x, y) => {

    const invalidateVisual = () => {
    }

    const speed = 200
    const dir = {x: Math.random() > 0.5 ? 1 : -1, y: -1}

    const self = {
        get tier() { return tier },
        get level() { return level },
        get name() { return `dragon_t${self.tier}_l${self.level}` },
        levelUp: () => {
            level += 1
            invalidateVisual()
        },
        update: dt => {
            self.visual.x += dir.x * speed * dt
            self.visual.y += dir.y * speed * dt

            if (self.visual.x >= renderer.vSize.x) {
                dir.x = -1
            }
            if (self.visual.x <= 0) {
                dir.x = 1
            }

            if (self.visual.y >= renderer.vSize.y*0.6) {
                dir.y = -1
            }
            if (self.visual.y <= 0) {
                dir.y = 1
            }
        }
    }

    Object.assign(self, ITypedObject(ObjectType.DRAGON))
    Object.assign(self, IVisual(`dragon_t${tier}`, x, y, 100, 100, RENDER_LAYER.BACKGROUND))
    // if (window.GD.config === 'development') {
    //     Object.assign(self, IVisualStageRepresentationOwner(self))
    // }

    return self
}