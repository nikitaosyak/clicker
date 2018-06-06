import {debugManager} from "./debugManager";
import {RENDER_LAYER, Renderer} from "./Renderer";
import {Resources} from "./Resrouces";
import {SCREEN_TYPE, ScreenMan} from "./game/screen/ScreenMan";
import {GameModel} from "./GameModel";
import {GameData} from "./GameData";
import {MathUtil} from "./utils/MathUtil";
import {URLParam} from "./utils/URLParam";
import {Plot} from "./tools/Plot";
import {VirtualPlayThrough} from "./tools/VirtualPlayThrough";
import {DragonMan} from "./game/DragonMan";
import {AdoptableSprite} from "./game/stretching/AdoptableSprite";

window.onload = () => {
    debugManager.init()

    PIXI.settings.MIPMAP_TEXTURES = false
    const resources = window.resources = Resources()
    const model = GameModel()
    window.GD = GameData(model)

    const startGame = () => {
        model.connect().then(() => {
            if (window.GD.config.MODE === 'development') {
                window.GAMEMODEL = model
                window.money = MathUtil
            }
            const renderer = Renderer()
            renderer.addResizableObject(new AdoptableSprite(
                'background',
                {x: 800, y: 1280},
                {x: 0.5, y: 0.5},
                {x: 'center', y: 'middle'},
                {x: Number.MAX_VALUE, y: Number.MAX_VALUE},
                RENDER_LAYER.BACKGROUND)
            )

            const dragons = DragonMan(renderer)

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
        window.GD.config.MODE === 'development') {
        Plot(window.GD)
    } else {
        resources
            .add('digest', 'assets/digest.json')
            .load(() => {
                const digest = resources.getJSON('digest')
                digest.images.forEach(i => {
                    resources.add(i.alias, i.path)
                })
                resources.load(startGame)
            })
    }
}

module.exports = {GameData, GameModel, VirtualPlayThrough}