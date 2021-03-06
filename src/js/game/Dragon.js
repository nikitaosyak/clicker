import {IAnimated, IVisualNumericRep} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";
import {MathUtil} from "../utils/MathUtil";
import {DragonMoveComponent} from "./DragonMoveComponent";
import {FlashAnimationVisual2} from "./FlashAnimationVisual2";
import {URLParam} from "../utils/URLParam";

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
        "emitterLifetime": 1,
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
    // tier = Math.random() > 0.5 ? 1 : 5
    // tier = Math.random() > 0.5 ? tier : 6
    // tier = 6
    // level = 1

    const movement = DragonMoveComponent(tier, level)
    const invalidateVisual = () => {
        self.visual.scale.x = movement.direction.x > 0 ? Math.abs(self.visual.scale.x) : -Math.abs(self.visual.scale.x)
    }
    const localBounds = { left: 0, right: 0, top: 0, bottom: 0, active: false }

    let emitter

    const ANIM_IDLE = `dragons_t${tier}_idle`
    const ANIM_IDLE_TEXTURES = []
    Object.keys(window.resources.getAnimation(ANIM_IDLE)).forEach(f => {
        ANIM_IDLE_TEXTURES.push(PIXI.Texture.fromFrame(f))
    })
    const ANIM_SPIT = `dragons_t${tier}_spit`
    const ANIM_SPIT_TEXTURES = []
    Object.keys(window.resources.getAnimation(ANIM_SPIT)).forEach(f => {
        ANIM_SPIT_TEXTURES.push(PIXI.Texture.fromFrame(f))
    })

    const scale = parseFloat(URLParam.GET('visualUpscale')) || 1
    //                        TIER:                1,                2,                3,                4,                5,                6
    const attackCooldown =     [-1,              0.6,             0.58,             0.56,             0.54,             0.52,              0.5][tier]
    const animationFireFrame = [-1,                9,                4,                6,                6,                6,                5][tier]
    const spitOffset =         [-1,  {x: 30, y: -30},  {x: -5, y: -30},  {x: 40, y: -25},  {x: 50, y: -50},  {x: 30, y: -30},  {x: 60, y: -30}][tier]
    const size =               [-1, {x: 120*scale, y: 120*scale}, {x: 120*scale, y: 120*scale}, {x: 120*scale, y: 120*scale}, {x: 145*scale, y: 160*scale}, {x: 150*scale, y: 150*scale}, {x: 180*scale, y: 180*scale}][tier]
    let currentAnimation = ANIM_IDLE
    let lastAttack = 0
    let scheduledShot = null

    let numberIdle
    let numberSpit
        numberIdle = FlashAnimationVisual2(`animation_belly_level_tier${tier}_idle`, level, tier)
        numberSpit = FlashAnimationVisual2(`animation_belly_level_tier${tier}_spit`, level, tier)


    const self = {
        scheduleAttack: () => {
            return new Promise((resolve) => {
                scheduledShot = resolve
            })
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
            numberSpit.updateLevel(level)
            numberIdle.updateLevel(level)

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

            if (currentAnimation === ANIM_IDLE) {
                self.visual.addChild(numberIdle.visual)
                self.visual.removeChild(numberSpit.visual)
                numberIdle.applyFrame(self.visual.currentFrame);
            }
            if (currentAnimation === ANIM_SPIT) {
                self.visual.removeChild(numberIdle.visual)
                self.visual.addChild(numberSpit.visual)
                numberSpit.applyFrame(self.visual.currentFrame);
            }

            if (scheduledShot) {
                if (currentAnimation === ANIM_IDLE) {
                    currentAnimation = ANIM_SPIT
                    self.visual.textures = ANIM_SPIT_TEXTURES
                    self.visual.animationSpeed = 0.35
                    self.visual.gotoAndPlay(0)
                } else {
                    if (self.visual.currentFrame === animationFireFrame) {
                        lastAttack = Date.now()
                        scheduledShot({x: spitOffset.x * movement.direction.x, y: spitOffset.y })
                        scheduledShot = null
                    }
                }
            }
            if (currentAnimation === ANIM_SPIT) {
                if (self.visual.currentFrame === self.visual.totalFrames-1) {
                    currentAnimation = ANIM_IDLE
                    self.visual.textures = ANIM_IDLE_TEXTURES
                    self.visual.animationSpeed = 0.35
                    self.visual.gotoAndPlay(0)
					
                    window.soundman.play(
                        'sound_sfx', 
                        `dragon${Math.random() > 0.5 ? 1 : 2}`,
                        0.05 + Math.random() * 0.2)
                }
            }
        }
    }

    Object.assign(self,
        IAnimated(ANIM_IDLE)
            .setSize(size.x, size.y)
            .setPosition(x, y)
            .setLayer(RENDER_LAYER.GAME)
            .setAnimationSpeed(0.35))

    const cfg = Object.assign({}, upgradeParticlesConfig)
    const color = [
        -1,         // particle color:
        "#28984a",  // tier 1
        "#7835dd",  // tier 2
        "#d52622",  // tier 3
        "#d5226a",  // tier 4
        "#3478dd",  // tier 5
        "#612e5a"   // tier 6
    ][tier]
    cfg.color.start = color
    cfg.color.end = color

    emitter = new PIXI.particles.Emitter(
        self.visual.parent,
        window.resources.getTexture('spec'),
        cfg)

    // Object.assign(self, IVisualNumericRep(self, 'level', 0.13, 0.15, 0xABABAB, 0.22))
    invalidateVisual()

    return self
}