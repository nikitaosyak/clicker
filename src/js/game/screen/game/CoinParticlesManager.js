import {IContainer} from "../../go/GameObjectBase";
import {RENDER_LAYER} from "../../../Renderer";

export const CoinParticlesManager = (gameScreen, targetLocation) => {

    const config = {
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 0.6,
            "end": 0.6,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 120,
            "end": 100,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 10,
            "max": 50
        },
        "lifetime": {
            "min": 0.9,
            "max": 0.1
        },
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": 0,
        "maxParticles": 500,
        "pos": {
            "x": 500,
            "y": 500
        },
        "addAtBack": false,
        "spawnType": "burst",
        "particlesPerWave": 1,
        "particleSpacing": 0,
        "angleStart": 0
    }
    let emitter
    let currentParticleToSpawn = 0

    const self = {
        update: dt => {
            const particles = emitter.update(dt)
            if (particles > 0) {
                currentParticleToSpawn = Math.max(0, currentParticleToSpawn - particles)
                if (currentParticleToSpawn === 0) {
                    emitter.emit = false
                }
            }
        },
        dropCoin: (fromSlot, value) => {
            // console.log(`drop ${value} coins from ${fromSlot}`)

            const spawnPos = gameScreen._slotItems[fromSlot].visual
            currentParticleToSpawn = value
            emitter.emitterLifetime = 2
            emitter.updateSpawnPos(spawnPos.x, spawnPos.y)
            emitter.emit = true
        }
    }
    Object.assign(self, IContainer(0, 0, RENDER_LAYER.UI))

    emitter = new PIXI.particles.Emitter(
        self.visual,
        {
            spritesheet: 'assets/anim/coin.png',
            framerate: 50,
            loop: true,
            textures: Object.keys(window.resources.getAnimation('anim_coin'))
                .map(k => PIXI.Texture.fromFrame(k))
        },
        config
    )
    emitter.emit = false
    emitter.particleConstructor = PIXI.particles.AnimatedParticle

    return self
}