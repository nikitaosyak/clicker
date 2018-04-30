import {Egg} from "./go/Egg";
import {StaticImage} from "./go/StaticImage";

export const Game = (renderer) => {

    renderer.addObject(StaticImage('background', 400, 640, 800, 1280))

    const clickables = [Egg(0), Egg(1), Egg(2)]
    clickables.forEach(renderer.addObject)

    return {
        update: (dt) => {
            clickables.forEach(c => {
                const clicks = c.extractClicks()
                if (clicks > 0) {
                    console.log(`extracted ${clicks} clicks`)
                }
            })
        }
    }
}