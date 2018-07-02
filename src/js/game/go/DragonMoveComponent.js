import {MAX_DRAGON_LEVEL} from "../../GameModel";

let COUNTER = 0

export const DragonMoveComponent = (tier, level) => {

    // units per second
    const BASE_SPEED = 150
    const MAX_SPEED = 280
    const ACCELERATION = 180
    const DECELERATION = 230
    const SPEED_MULTS = [0.8, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98, 1.01]
    const SPEED_RANDOMIZERS = [-0.12, -0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09, 0.12]
    const RANDOMIZER = SPEED_RANDOMIZERS[COUNTER++%SPEED_RANDOMIZERS.length]

    let currentSpeed = BASE_SPEED
    let currentSpeedVariation = 0
    const currentDirection = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}
    let nextDecisionIn = 3 + Math.random() * 3

    const self =  {
        get direction() { return currentDirection },
        updateSpeedVariation: (level) => {
            currentSpeedVariation = SPEED_MULTS[tier] + ((level/MAX_DRAGON_LEVEL) * 0.15) + RANDOMIZER
        },
        update: (sprite, bounds, localBounds, dt) => {
            let directionChange = false
            let outOfBounds = false

            nextDecisionIn -= dt
            if (nextDecisionIn <= 0) {
                currentDirection.x *= -1
                currentDirection.y *= Math.random() > 0.5 ? 1 : -1

                nextDecisionIn = 3 + Math.random() * 3
                directionChange = true
            }

            if (sprite.x >= (localBounds.active ? localBounds.right : bounds.right)) {
                currentDirection.x = -1
                directionChange = true
                outOfBounds = true
            }
            if (sprite.x <= (localBounds.active ? localBounds.left : bounds.left)) {
                currentDirection.x = 1
                directionChange = true
                outOfBounds = true
            }

            if (sprite.y >= (localBounds.active ? localBounds.bottom : bounds.bottom)) {
                currentDirection.y = -1
                outOfBounds = true
            }
            if (sprite.y <= (localBounds.active ? localBounds.top : bounds.top)) {
                currentDirection.y = 1
                outOfBounds = true
            }

            if (outOfBounds) {  // accelerate if out of bounds
                currentSpeed = Math.min(currentSpeed + ACCELERATION * dt, MAX_SPEED)
            } else {            // normalize speed if inside bounds
                currentSpeed = Math.max(currentSpeed - DECELERATION * dt, BASE_SPEED)
            }

            // console.log(currentDirection, currentSpeed, currentSpeedVariation)

            sprite.x += currentDirection.x * currentSpeed * currentSpeedVariation * dt
            sprite.y += currentDirection.y * currentSpeed * currentSpeedVariation * dt

            return directionChange
        }
    }

    self.updateSpeedVariation(level)
    return self
}