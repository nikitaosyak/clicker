import {ITypedObject, IVisual, IVisualNumericRep, ObjectType} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

export const Dragon = (renderer, tier, level, x, y) => {

    const invalidateVisual = () => {
        self.visual.scale.x = dir.x > 0 ? Math.abs(self.visual.scale.x) : -Math.abs(self.visual.scale.x)
    }

    const speed = 200
    const dir = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}

    const bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }
    let nextDecisionIn = 3 + Math.random() * 3
    let speedMult = 1

    const self = {
        get tier() { return tier },
        get level() { return level },
        get name() { return `dragon_t${self.tier}_l${self.level}` },
        levelUp: () => {
            level += 1
            if (window.GD.config.MODE === 'development') {
                console.log(self)
                self.tierVisualRefresh()
                self.levelVisualRefresh()
            }
        },
        setBounds: (left, right, top, bottom) => {
            bounds.left = left; bounds.right = right;
            bounds.top = top; bounds.bottom = bottom;
        },
        update: dt => {
            let dirChange = false

            nextDecisionIn -= dt
            if (nextDecisionIn <= 0) {
                dir.x *= -1
                dir.y *= Math.random() > 0.5 ? 1 : -1
                speedMult = 0.9 + Math.random() * 0.2

                nextDecisionIn = 3 + Math.random() * 3
                dirChange = true
            }
            if (self.visual.x >= /*renderer.vSize.x*/bounds.right) {
                dir.x = -1
                dirChange = true
            }
            if (self.visual.x <= /*0*/bounds.left) {
                dir.x = 1
                dirChange = true
            }

            if (self.visual.y >= /*renderer.vSize.y*0.6*/bounds.bottom) {
                dir.y = -1
            }
            if (self.visual.y <= /*0*/bounds.top) {
                dir.y = 1
            }

            if (dirChange) {
                invalidateVisual()
            }

            self.visual.x += dir.x * speed * speedMult * dt
            self.visual.y += dir.y * speed * speedMult * dt
        }
    }

    Object.assign(self, ITypedObject(ObjectType.DRAGON))
    Object.assign(self, IVisual(`dragon_t${tier}`, x, y, 100, 100, RENDER_LAYER.BACKGROUND))
    if (window.GD.config.MODE === 'development') {
        Object.assign(self, IVisualNumericRep(self, 'tier', -0.3, 0.3, 0xCCCC00, 0.4))
        Object.assign(self, IVisualNumericRep(self, 'level', 0.3, 0.3, 0xCCCCCC, 0.4))
    }
    invalidateVisual()

    return self
}