import {debugManager} from "./debugManager";
import {Renderer} from "./Renderer";
import {Resources} from "./Resrouces";
import {ENV} from "./ENV"
import {SCREEN_TYPE, ScreenMan} from "./game/screen/ScreenMan";
import {StaticImage} from "./game/go/StaticImage";

window.onload = () => {

    ENV.init()
    debugManager.init()

    PIXI.settings.MIPMAP_TEXTURES = false
    const resources = window.resources = Resources()

    const startGame = () => {
        const renderer = Renderer()
        renderer.addObject(StaticImage('background', 400, 640, 800, 1280))
        const screens = ScreenMan(renderer)
        screens.instantTransit(SCREEN_TYPE.GAME)

        let time = Date.now()
        const gameLoop = () => {
            debugManager.frameStarted()

            let dt = Date.now() - time
            time = Date.now()

            screens.update(dt)
            renderer.update()

            requestAnimationFrame(gameLoop)

            debugManager.frameEnded()
        }
        requestAnimationFrame(gameLoop)
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