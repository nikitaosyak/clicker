
export const DivVanisher = () => {

    const preloaderImage = document.getElementById('loader')
    const WAIT_INSTANTIATE = 2
    const VANISH_SPEED = 1
    let currentTimer = 0
    let currentOpacity = 1
    let done = false

    document.body.removeChild(document.getElementById('progress'))

    return {
        get running() { return !done },
        update: dt => {
            if (currentTimer < WAIT_INSTANTIATE) {
                currentTimer += dt
                return
            }

            currentOpacity -= VANISH_SPEED * dt
            if (currentOpacity <= 0) {
                done = true
                document.body.removeChild(preloaderImage)
                return
            }

            preloaderImage.style.opacity = currentOpacity
        }
    }
}