import {debugManager} from "./debugManager";
import {Renderer} from "./Renderer";
import {Resources} from "./Resrouces";
import {SCREEN_TYPE, ScreenMan} from "./game/screen/ScreenMan";
import {StaticImage} from "./game/go/StaticImage";
import {GameModel} from "./GameModel";
import {GameData} from "./GameData";

window.onload = () => {

    debugManager.init()

    PIXI.settings.MIPMAP_TEXTURES = false
    const resources = window.resources = Resources()

    const startGame = () => {
        const model = GameModel()
        model.connect().then(() => {
            window.GD = GameData(model)
            const renderer = Renderer()
            renderer.addObject(StaticImage('background', 400, 640, 800, 1280))

            const screens = ScreenMan(renderer, model)
            screens.instantTransit(SCREEN_TYPE.GAME)
            // screens.instantTransit(SCREEN_TYPE.UPGRADE)

            let time = Date.now()
            const gameLoop = () => {
                debugManager.frameStarted()

                let dt = (Date.now() - time)/1000
                dt = Math.min(dt, 0.02) // cap delta time for inactivity period
                time = Date.now()

                screens.update(dt)
                renderer.update(dt)

                requestAnimationFrame(gameLoop)

                debugManager.frameEnded()
            }
            requestAnimationFrame(gameLoop)
        })
    }

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