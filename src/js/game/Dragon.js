import {IAnimated, IVisual, IVisualNumericRep, ObjectType} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";
import {MathUtil} from "../utils/MathUtil";
import {DragonMoveComponent} from "./DragonMoveComponent";

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
    // tier = 5

    const movement = DragonMoveComponent(tier, level)
    const invalidateVisual = () => {
        self.visual.scale.x = movement.direction.x > 0 ? Math.abs(self.visual.scale.x) : -Math.abs(self.visual.scale.x)
    }
    const localBounds = { left: 0, right: 0, top: 0, bottom: 0, active: false }

    //                    TIER:   1,    2,    3,    4,    5,   6,   7,     8,    9,   10
    const attackCooldown = [-1, 0.6, 0.58, 0.56, 0.54, 0.52, 0.5, 0.48, 0.46, 0.44, 0.42][tier]
    let lastAttack = 0

    let emitter

    const ANIM_IDLE = `dragons_t${tier}_idle`
    const ANIM_IDLE_TEXTURES = []
    if (tier < 6) {
        Object.keys(window.resources.getAnimation(ANIM_IDLE)).forEach(f => {
            ANIM_IDLE_TEXTURES.push(PIXI.Texture.fromFrame(f))
        })
    }
    const ANIM_SPIT = `dragons_t${tier}_spit`
    const ANIM_SPIT_TEXTURES = []
    if (tier < 6) {
        Object.keys(window.resources.getAnimation(ANIM_SPIT)).forEach(f => {
            ANIM_SPIT_TEXTURES.push(PIXI.Texture.fromFrame(f))
        })
    }
    const animationFireFrame = [-1, 9, 4, 6, 6, 6]
    const spitOffset = [0, {x: 30, y: -30}, {x: -5, y: -30}, {x: 40, y: -25}, {x: 50, y: -50}, {x: 30, y: -30}, {x: 30, y: -30}, {x: 30, y: -30}, {x: 30, y: -30}, {x: 30, y: -30}, {x: 30, y: -30}]
    const sizes = [-1, {x: 120, y: 120}, {x: 120, y: 120}, {x: 120, y: 120}, {x: 145, y: 160}, {x: 120, y: 120}]
    let currentAnimation = ANIM_IDLE

    let scheduledShot = null

    const self = {
        scheduleAttack: () => {
            if (tier < 6) {
                return new Promise((resolve) => {
                    scheduledShot = resolve
                })
            } else {
                return new Promise((resolve) => {
                    resolve(spitOffset[tier])
                })
            }
        },
        canAttack: (urgencyCoefficient=1) => {
            urgencyCoefficient = MathUtil.clamp(0.01, 10, urgencyCoefficient)
            const timeSinceLastAttack = (Date.now() - lastAttack) / 1000
            return !scheduledShot && timeSinceLastAttack > (attackCooldown * urgencyCoefficient)
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
        get boundsDifference() {
            let largestDifference = 0
            const currentBounds = localBounds.active ? localBounds : bounds
            if (self.visual.x >= currentBounds.right) {
                largestDifference = Math.max(largestDifference, self.visual.x - currentBounds.right)
            }
            if (self.visual.x <= currentBounds.left) {
                largestDifference = Math.max(largestDifference, currentBounds.left - self.visual.x)
            }

            if (self.visual.y >= currentBounds.bottom) {
                largestDifference = Math.max(largestDifference, self.visual.y - currentBounds.bottom)
            }
            if (self.visual.y <= currentBounds.top) {
                largestDifference = Math.max(largestDifference, currentBounds.top - self.visual.y)
            }
            return largestDifference
        },
        levelUp: () => {
            level += 1
            self.levelVisualRefresh()

            self.visual.parent.addChild(self.visual)

            movement.updateSpeedVariation(level)

            emitter.parent = self.visual.parent
            emitter.playOnce()
        },
        update: dt => {
            emitter.updateSpawnPos(self.visual.x, self.visual.y)
            emitter.update(dt)

            const dirChange = movement.update(self.visual, bounds, localBounds, dt)
            dirChange && invalidateVisual()

            if (tier < 6) {
                if (scheduledShot) {
                    if (currentAnimation === ANIM_IDLE) {
                        currentAnimation = ANIM_SPIT
                        self.visual.textures = ANIM_SPIT_TEXTURES
                        self.visual.gotoAndPlay(0)
                    } else {
                        if (self.visual.currentFrame === animationFireFrame[tier]) {
                            lastAttack = Date.now()
                            scheduledShot({x: spitOffset[tier].x * movement.direction.x, y: spitOffset[tier].y })
                            scheduledShot = null
                        }
                    }
                }
                if (currentAnimation === ANIM_SPIT) {
                    if (self.visual.currentFrame === self.visual.totalFrames-1) {
                        currentAnimation = ANIM_IDLE
                        self.visual.textures = ANIM_IDLE_TEXTURES
                        self.visual.gotoAndPlay(0)
                    }
                }
            }
        }
    }

    if (tier < 6) {
        Object.assign(self,
            IAnimated(ANIM_IDLE)
                .setSize(sizes[tier].x, sizes[tier].y)
                .setPosition(x, y)
                .setLayer(RENDER_LAYER.BACKGROUND)
                .setAnimationSpeed(0.35))
    } else {
        Object.assign(self,
            IVisual(`dragon_t${tier}`)
                .setSize(100, 100)
                .setPosition(x, y)
                .setLayer(RENDER_LAYER.BACKGROUND)
        )
    }

    const cfg = Object.assign({}, upgradeParticlesConfig)
    const color = [
        -1,         // particle color:
        "#00AA00",  // tier 1
        "#2222BB",  // tier 2
        "#FF8c00",  // tier 3
        "#FF22FF",  // tier 4
        "#22AAAA",  // tier 5
        "#AAAAAA"   // tier 6
    ][tier]
    cfg.color.start = color
    cfg.color.end = color

    emitter = new PIXI.particles.Emitter(
        self.visual.parent,
        window.resources.getTexture('spec'),
        cfg)

    Object.assign(self, IVisualNumericRep(self, 'level', 0.13, 0.15, 0xABABAB, 0.22))
    invalidateVisual()

    return self
}