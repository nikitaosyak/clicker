import {StaticImage} from "./go/StaticImage";
import {SlotItemGenerator} from "./SlotItemGenerator";

export const Game = (renderer) => {

    renderer.addObject(StaticImage('background', 400, 640, 800, 1280))

    const generator = SlotItemGenerator(renderer)
    const currentItems = [null, null, null]
    generator.populate(currentItems)

    return {
        update: (dt) => {
            currentItems.forEach((c, i) => {
                const clicks = c.extractClicks()
                if (clicks > 0) {
                    console.log(`extracted ${clicks} clicks from ${c.name}`)
                    c.applyClicks(clicks * 10)
                    if (c.health <= 0) {
                        currentItems[i].destroy()
                        currentItems[i] = null
                        generator.populate(currentItems)
                    }
                }
            })
        }
    }
}