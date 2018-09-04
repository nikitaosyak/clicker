
export const DivVanisher = () => {

    const preloaderImage = document.getElementById('loader')
    const progressBar = document.getElementById('progress')
    const VANISH_SPEED = 1.3
    let currentOpacity = 1
    let done = false

    return {
        get running() { return !done },
        update: dt => {
            currentOpacity -= VANISH_SPEED * dt
            if (currentOpacity <= 0) {
                done = true
                document.body.removeChild(preloaderImage)
                document.body.removeChild(progressBar)
                return
            }

            preloaderImage.style.opacity = currentOpacity
            preloaderImage.style.filter = currentOpacity

            progressBar.style.opacity = currentOpacity
            progressBar.style.filter = currentOpacity
        }
    }
}