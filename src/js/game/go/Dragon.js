import {ITypedObject, IVisual, IVisualNumericRep, ObjectType} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";
import {MathUtil} from "../../utils/MathUtil";

const upgradeParticlesConfig = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 1.2,
            "end": 0.9,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#c9d400",
            "end": "#e3f70a"
        },
        "speed": {
            "start": 10,
            "end": 30,
            "minimumSpeedMultiplier": 2
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 10,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.8,
            "max": 0.8
        },
        "blendMode": "add",
        "frequency": 0.01,
        "emitterLifetime": 2,
        "maxParticles": 100,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 45,
            "minR": 1
        },
        "emit": false
    }

export const Dragon = (bounds, tier, level, x, y) => {

    const invalidateVisual = () => {
        self.visual.scale.x = dir.x > 0 ? Math.abs(self.visual.scale.x) : -Math.abs(self.visual.scale.x)
    }

    const speed = 200
    const dir = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}

    let nextDecisionIn = 3 + Math.random() * 3
    let speedMult = 1
    const localBounds = { left: 0, right: 0, top: 0, bottom: 0, active: false }

    //                    TIER:   1,    2,    3,    4,    5,   6,   7,     8,    9,   10
    const attackCooldown = [-1, 0.6, 0.58, 0.56, 0.54, 0.52, 0.5, 0.48, 0.46, 0.44, 0.42][tier]
    let lastAttack = -1

    let emitter

    const self = {
        setAttackFlag: () => lastAttack = Date.now(),
        canAttack: (urgencyCoefficient=1) => {
            urgencyCoefficient = MathUtil.clamp(0.01, 10, urgencyCoefficient)
            const timeSinceLastAttack = (Date.now() - lastAttack) / 1000
            return timeSinceLastAttack > (attackCooldown * urgencyCoefficient)
        },
        get tier() { return tier },
        get level() { return level },
        get name() { return `dragon_t${self.tier}_l${self.level}` },
        setLocalBounds: (left, right, top, bottom) => {
            localBounds.left = left; localBounds.right = right;
            localBounds.top = top; localBounds.bottom = bottom;
            localBounds.active = true
        },
        deactivateLocalBounds: () => {
            localBounds.active = false
        },
        levelUp: () => {
            level += 1
            if (window.GD.config.MODE === 'development') {
                self.tierVisualRefresh()
                self.levelVisualRefresh()
            }

            self.visual.parent.addChild(self.visual)

            emitter.parent = self.visual.parent
            emitter.playOnce()
        },
        update: dt => {

            emitter.updateSpawnPos(self.visual.x, self.visual.y)
            emitter.update(dt)

            let dirChange = false

            nextDecisionIn -= dt
            if (nextDecisionIn <= 0) {
                dir.x *= -1
                dir.y *= Math.random() > 0.5 ? 1 : -1
                speedMult = 0.9 + Math.random() * 0.2

                nextDecisionIn = 3 + Math.random() * 3
                dirChange = true
            }
            if (self.visual.x >= (localBounds.active ? localBounds.right : bounds.right)) {
                dir.x = -1
                dirChange = true
            }
            if (self.visual.x <= (localBounds.active ? localBounds.left : bounds.left)) {
                dir.x = 1
                dirChange = true
            }

            if (self.visual.y >= (localBounds.active ? localBounds.bottom : bounds.bottom)) {
                dir.y = -1
            }
            if (self.visual.y <= (localBounds.active ? localBounds.top : bounds.top)) {
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

    const cfg = Object.assign({}, upgradeParticlesConfig)
    const color = [
        -1, "#00AA00",
        "#FF2222",
        "#111111",
        "#FF22FF",
        "#AAAA22",
        "#22AAAA"
    ][tier]
    cfg.color.start = color
    cfg.color.end = color

    emitter = new PIXI.particles.Emitter(
        self.visual.parent,
        window.resources.getTexture('spec'),
        cfg)

    return self
}