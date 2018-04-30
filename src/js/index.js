import {debugManager} from "./debugManager";
import {Renderer} from "./Renderer";
import {Resources} from "./Resrouces";
import {Game} from "./game/Game";
import {ENV} from "./ENV"

window.onload = () => {

    ENV.init()
    debugManager.init()

    PIXI.settings.MIPMAP_TEXTURES = false
    const resources = window.resources = Resources()

    const startGame = () => {
        const renderer = Renderer()
        const game = Game(renderer)

        let time = Date.now()
        const gameLoop = () => {
            debugManager.frameStarted()

            let dt = Date.now() - time
            time = Date.now()

            game.update(dt)
            renderer.update()

            requestAnimationFrame(gameLoop)

            debugManager.frameEnded()
        }
        requestAnimationFrame(gameLoop)
    }

    resources
        .add('pixel', 'assets/pixel.png')
        .add('background', 'assets/background.jpg')
        .add('egg', 'assets/egg.png')
        .add('chest', 'assets/chest.png')
        .load(() => {
            startGame()
        })
}