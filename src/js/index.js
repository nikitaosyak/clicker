import {debugManager} from "./debug/debugManager";
import {Renderer} from "./Renderer";
import {Resources} from "./Resources";
import {SCREEN_TYPE, ScreenMan} from "./screen/ScreenMan";
import {GameModel} from "./model/GameModel";
import {GameData} from "./model/GameData";
import {MathUtil} from "./utils/MathUtil";
import {URLParam} from "./utils/URLParam";
import {Plot} from "./tools/Plot";
import {VirtualPlayThrough} from "./tools/VirtualPlayThrough";
import {DragonMan} from "./game/DragonMan";
import {SkipForwardPlayThrough} from "./tools/SkipForwardPlayThrough";
import {Config} from './Config'
import {Platform} from './platform/Platform'
import {SoundMan} from './SoundMan'
import {DialogMan} from "./screen/modal/DialogMan";
import {Localization} from "./Localization";

window.onload = () => {
    debugManager.init()

    PIXI.settings.MIPMAP_TEXTURES = false
    window.config = Config()
    const resources = window.resources = Resources()
    const model = GameModel()
    window.GD = GameData(model)

    const startGame = (progress) => {
        model.connect().then(() => {
            window.soundman.play2('sound_music', 0.05)
            window.soundman.applySettings(model.settings)
            progress && window.GD.progressToStage(model.stage)
            if (window.config.MODE === 'development') {
                window.GAMEMODEL = model
                window.money = MathUtil
            }
            const renderer = Renderer()
            window.dialogs = DialogMan(renderer)

            const dragons = DragonMan(renderer, window.GD.getClickDamage(model.dragons))

            const screens = ScreenMan(dragons, renderer, model)
            screens.instantTransit(SCREEN_TYPE.GAME)
            // screens.instantTransit(SCREEN_TYPE.UPGRADE)

            let time = Date.now()
            const gameLoop = () => {
                debugManager.frameStarted()

                let dt = (Date.now() - time)/1000
                dt = Math.min(dt, 0.02) // cap delta time for inactivity period
                time = Date.now()

                dragons.update(dt)
                screens.update(dt)
                renderer.update(dt)

                requestAnimationFrame(gameLoop)

                debugManager.frameEnded()
            }
            requestAnimationFrame(gameLoop)
        })
    }

    if (URLParam.GET('plot') === 'true' &&
        window.config.MODE === 'development') {
        Plot(window.GD)
    } else {
        window.platform = Platform()
        window.platform.init()
        .then(() => {
            resources
            .add('digest', 'assets/digest.json')
            .load(() => {
                const digest = resources.getJSON('digest')
                digest.images.forEach(i => {
                    resources.add(i.alias, i.path)
                })
                resources.load(() => {
                    window.soundman = SoundMan(digest.audio)
                    window.localization = Localization(URLParam.GET('locale')||'en')
                    if (URLParam.GET('stage')) {
                        model.connect().then(() => {
                            model.reset()
                            SkipForwardPlayThrough(model, window.GD, Number.parseInt(URLParam.GET('stage')))
                            model.close()
                            window.location.href = window.location.origin
                            // startGame(false)
                        })
                    } else {
                        startGame(true)
                    }
                })
            })
        })
        .catch(e => {
            console.error(e)
        })
    }
}

module.exports = {GameData, GameModel, VirtualPlayThrough}