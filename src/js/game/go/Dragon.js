import {ITypedObject, IVisual, IVisualNumericRep, ObjectType} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

export const Dragon = (bounds, tier, level, x, y) => {

    const invalidateVisual = () => {
        self.visual.scale.x = dir.x > 0 ? Math.abs(self.visual.scale.x) : -Math.abs(self.visual.scale.x)
    }

    const speed = 200
    const dir = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}

    let nextDecisionIn = 3 + Math.random() * 3
    let speedMult = 1
    const localBounds = { left: 0, right: 0, top: 0, bottom: 0 }

    //                    TIER:   1,    2,    3,    4,    5,   6,   7,     8,    9,   10
    const attackCooldown = [-1, 0.6, 0.58, 0.56, 0.54, 0.52, 0.5, 0.48, 0.46, 0.44, 0.42][tier]
    let lastAttack = -1

    const self = {
        setAttackFlag: () => lastAttack = Date.now(),
        canAttack: () => ((Date.now() - lastAttack) / 1000 > attackCooldown),
        get tier() { return tier },
        get level() { return level },
        get name() { return `dragon_t${self.tier}_l${self.level}` },
        setLocalBounds: (left, right, top, bottom) => {
            localBounds.left = left; localBounds.right = right;
            localBounds.top = top; localBounds.bottom = bottom;
        },
        levelUp: () => {
            level += 1
            if (window.GD.config.MODE === 'development') {
                console.log(self)
                self.tierVisualRefresh()
                self.levelVisualRefresh()
            }
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
            if (self.visual.x >= (bounds.active ? bounds.right : localBounds.right)) {
                dir.x = -1
                dirChange = true
            }
            if (self.visual.x <= (bounds.active ? bounds.left : localBounds.left)) {
                dir.x = 1
                dirChange = true
            }

            if (self.visual.y >= (bounds.active ? bounds.bottom : localBounds.bottom)) {
                dir.y = -1
            }
            if (self.visual.y <= (bounds.active ? bounds.top : localBounds.top)) {
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