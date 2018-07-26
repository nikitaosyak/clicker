import {IContainer} from "../behaviours/Base";
import {RENDER_LAYER} from "../Renderer";

export const CoinParticlesManager = (gameScreen, targetLocation) => {

    const config = {
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 0.3,
            "end": 0.6,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 160,
            "end": 130,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 300
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
            "min": 1.1,
            "max": 1.2
        },
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": 0,
        "maxParticles": 500,
        "pos": {
            "x": 500,
            "y": 500
        },
        "addAtBack": true,
        "spawnType": "burst",
        "particlesPerWave": 1,
        "particleSpacing": 0,
        "angleStart": 0,
        "emit": false
    }
    let emitters = []
    let currentParticleToSpawn = [0, 0, 0]

    const self = {
        update: dt => {
            emitters.forEach((emitter, i) => {
                if (currentParticleToSpawn[i] <= 0) {
                    emitter.update(dt)
                    return
                }
                let currentDelta = 0
                while (currentDelta < dt) {
                    currentDelta += config.frequency
                    const particles = emitter.update(config.frequency)
                    if (particles > 0) {
                        currentParticleToSpawn[i] = Math.max(0, currentParticleToSpawn[i] - particles)
                        if (currentParticleToSpawn[i] === 0) {
                            emitter.emit = false
                            currentDelta = dt
                        }
                    }
                }
            })
        },
        dropCoin: (fromSlot, value) => {
            // console.log(`drop ${value} coins from ${fromSlot}`)

            const spawnPos = gameScreen._slotItems[fromSlot].visual
            currentParticleToSpawn[fromSlot] = value
            emitters[fromSlot].emitterLifetime = [0.3, 0.45, 0.7][fromSlot]
            emitters[fromSlot].updateSpawnPos(spawnPos.x, spawnPos.y)
            emitters[fromSlot].emit = true
        }
    }
    Object.assign(self, IContainer(0, 0, RENDER_LAYER.UI))

    for (let i = 0; i < 3; i++) {
        emitters.push(new PIXI.particles.Emitter(
            self.visual,
            {
                spritesheet: 'assets/anim/coin.png',
                framerate: 50,
                loop: true,
                textures: Object.keys(window.resources.getAnimation('anim_coin'))
                    .map(k => PIXI.Texture.fromFrame(k))
            },
            config
        ))
        emitters[i].particleConstructor = PIXI.particles.AnimatedParticle
    }


    return self
}