
export const SoundMan = audioDigest => {

    const parseDescriptor = source => {
        const result = {}
        source.split("\n").forEach(line => {
            const column = line.split('\t')
            result[column[2].replace(/\r/, '')] = {
                start:  parseFloat(column[0]), 
                end:    parseFloat(column[1])
            }
        })
        return result
    }

    const config = {
        coin1 : { timeout: 20, instances: 5 },
        coin2 : { timeout: 20, instances: 5 },
        coins : { timeout: 0, instances: 3 },
        chestDrop : { timeout: 0, instances: 3 },
        dragon1 : { timeout: 100, instances: 10 },
        dragon2 : { timeout: 50, instances: 10 },
        upgrade1 : { timeout: 100, instances: Number.MAX_VALUE },
        upgrade2 : { timeout: 100, instances: Number.MAX_VALUE },
        upgrade3 : { timeout: 0, instances: Number.MAX_VALUE },
        upgrade4 : { timeout: 0, instances: Number.MAX_VALUE },
        upgrade5 : { timeout: 0, instances: Number.MAX_VALUE },
        swipe1 : { timeout: 1000, instances: 1 },
        swipe2 : { timeout: 1000, instances: 1 },
        dmg1 : { timeout: 20, instances: 10 },
        dmg2 : { timeout: 20, instances: 10 },
        dmg3 : { timeout: 20, instances: 10 },
        dmg4 : { timeout: 20, instances: 10 },
        dmg5 : { timeout: 20, instances: 10 },
        dmg6 : { timeout: 20, instances: 10 },
        dmg7 : { timeout: 20, instances: 10 },
        chest : { timeout: 0, instances: 3 },
        egg1 : { timeout: 0, instances: 1 },
        egg2 : { timeout: 0, instances: 1 }
    }

    const atlases = {}
    const state = {}
    let canMusic = true
    let canSfx = true

    audioDigest.forEach(a => {
        if (window.resources.hasResource(`${a.alias}_descriptor`)) {
            const spriteMap = parseDescriptor(window.resources.getText(`${a.alias}_descriptor`))
            atlases[a.alias] = PIXI.sound.Sound.from({
                url: a.path + '.mp3',
                sprites: spriteMap,
                preload: true,
                autoPlay: false
            })
            state[a.alias] = {}
        } else {
            PIXI.sound.add(a.alias, a.path + '.mp3')
        }
    })

    const self = {
        play: (atlas, alias, volume) => {
            if (!canSfx) return
            // console.log(PIXI.sound.exists(atlas))
            // console.log(atlases[atlas])
            let fxState = state[atlas][alias]
            if (!fxState) {
                fxState = { launchTime: 0, instances: 0 }
                state[atlas][alias] = fxState
            }

            if ((Date.now() - fxState.launchTime) > config[alias].timeout && 
                fxState.instances < config[alias].instances) {

                try {
                    const fx = atlases[atlas].play({
                        sprite: alias,
                        volume: volume,
                        complete: () => {
                            state[atlas][alias].instances -= 1
                        }
                    })
                    fx.catch && fx.catch(e => {
                        // console.log(e)
                    })
                } catch (e) {
                    // console.log(e)
                }

                fxState.launchTime = Date.now()
                fxState.instances += 1
            }
        },
        play2: (alias, volume) => {
            PIXI.sound.play(alias, {loop: true, loaded: () => {
                if (!canMusic) {
                    PIXI.sound.pause(alias)
                }
            }})
            PIXI.sound.volume(alias, volume)
        },
        applySettings: (settings) => {
            if (settings.music) {
                PIXI.sound.resume('sound_music')
            } else {
                PIXI.sound.pause('sound_music')
            }

            canMusic = settings.music
            canSfx = settings.sfx
        }
    }

    return self
}