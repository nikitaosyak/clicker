import {MathUtil} from "../utils/MathUtil";

export const IAdoptable = (visual, pivotRules, stretch = false) => {
    return {
        adopt: (currentAr, virtualAr, canvasSize, virtualCanvasSize, maxAr) => {

            if (stretch) {
                visual.height = canvasSize.y
                visual.scale.x = visual.scale.y
                // if (currentAr > virtualAr) {    // wide screen
                //     visual.width = canvasSize.x
                //     // noinspection JSSuspiciousNameCombination
                //     visual.scale.y = visual.scale.x
                // } else {                        // tall screen
                //     visual.height = canvasSize.y
                //     // noinspection JSSuspiciousNameCombination
                //     visual.scale.x = visual.scale.y
                // }
            }

            if (pivotRules !== null) {
                const xPivot = pivotRules.x
                let xOffset = typeof pivotRules.xOffset === 'undefined' ? 0 : pivotRules.xOffset
                const xOffsetMin = typeof pivotRules.xOffsetMin === 'undefined' ? xOffset : pivotRules.xOffsetMin
                const xOffsetMax = typeof pivotRules.xOffsetMax === 'undefined' ? xOffsetMin : pivotRules.xOffsetMax
                xOffset = MathUtil.lerp(xOffsetMin, xOffsetMax, Math.max(0, (virtualCanvasSize.y*currentAr - virtualCanvasSize.x)) / (virtualCanvasSize.y*maxAr - virtualCanvasSize.x))
                if (typeof xPivot === 'string') {
                    if (xPivot === 'center') {
                        visual.x = canvasSize.x/2
                        visual.x += xOffset
                    }
                    if (xPivot === 'left') {
                        visual.x = 0
                        visual.x += xOffset
                    }
                    if (xPivot === 'right') {
                        visual.x = canvasSize.x
                        visual.x -= xOffset
                    }
                }

                const yPivot = pivotRules.y
                const yOffset = typeof pivotRules.yOffset === 'undefined' ? 0 : pivotRules.yOffset
                if (typeof  yPivot === 'string') {
                    if (yPivot === 'middle') {
                        visual.y = canvasSize.y/2
                        visual.y += yOffset
                    }
                    if (yPivot === 'top') {
                        visual.y = 0
                        visual.y += yOffset
                    }
                    if (yPivot === 'bottom') {
                        visual.y = canvasSize.y
                        visual.y -= yOffset
                    }
                }
            }

        }
    }
}