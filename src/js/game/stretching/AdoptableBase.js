export class AdoptableBase {

    constructor(size, pivotRules, stretchRules) {
        this.originalSize = size
        this.pivotRules = pivotRules
        this.stretchRules = stretchRules
    }

    adopt(currentAr, virtualAr, canvasSize) {

        if (this.stretchRules !== null) {
            if (currentAr > virtualAr) {    // wide screen
                this.visual.width = canvasSize.x
                this.visual.scale.y = this.visual.scale.x
            } else {                        // tall screen
                this.visual.height = canvasSize.y
                this.visual.scale.x = this.visual.scale.y
            }
        }

        if (this.pivotRules !== null) {
            const xPivot = this.pivotRules.x
            if (typeof xPivot === 'string') {
                if (xPivot === 'center') {
                    this.visual.x = canvasSize.x/2
                }
            }

            const yPivot = this.pivotRules.y
            if (typeof  yPivot === 'string') {
                if (yPivot === 'middle') {
                    this.visual.y = canvasSize.y/2
                }
            }
        }

    }
}