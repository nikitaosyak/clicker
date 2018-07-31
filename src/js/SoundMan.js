
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
        console.log(JSON.stringify(result))
        return result
    }

    const config = {
        coin1 : { timeout: 20, instances: 5 },
        coin2 : { timeout: 20, instances: 5 },
        coins : { timeout: 0, instances: 3 },
        chestDrop : { timeout: 0, instances: 3 },
        dragon1 : { timeout: 20, instances: 10 },
        dragon2 : { timeout: 20, instances: 10 },
        upgrade1 : { timeout: 0, instances: Number.MAX_VALUE },
        upgrade2 : { timeout: 0, instances: Number.MAX_VALUE },
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

    audioDigest.forEach(a => {
        if (window.resources.hasResource(`${a.alias}_descriptor`)) {
            const spriteMap = parseDescriptor(window.resources.getText(`${a.alias}_descriptor`))
            console.log(spriteMap)
            atlases[a.alias] = PIXI.sound.Sound.from({
                url: a.path + '.mp3',
                sprites: spriteMap,
                preload: true
            })
            state[a.alias] = {}
        } else {
            PIXI.sound.add(a.alias, a.path + '.mp3')
        }
    })
    const self = {
        play: (atlas, alias, volume) => {
            let fxState = state[atlas][alias]
            if (!fxState) {
                fxState = { launchTime: 0, instances: 0 }
                state[atlas][alias] = fxState
            }

            console.log(alias)
            if ((Date.now() - fxState.launchTime) > config[alias].timeout && 
                fxState.instances < config[alias].instances) {
                const fx = atlases[atlas].play({
                    sprite: alias,
                    volume: volume,
                    complete: () => {
                        state[atlas][alias].instances -= 1
                    }
                })
                fxState.launchTime = Date.now()
                fxState.instances += 1
            }
        },
        play2: (alias, volume) => {
            PIXI.sound.play(alias, {loop: true})
            PIXI.sound.volume(alias, volume)
        }
    }

    return self
}