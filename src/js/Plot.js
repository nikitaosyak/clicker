
export const Plot = () => {
    document.body.removeChild(document.getElementById('gameCanvas'))
    const plotDiv = document.createElement('div')
    plotDiv.style.cssText = 'width:100%; height:50%'
    document.body.appendChild(plotDiv)

    const plotDiv2 = document.createElement('div')
    plotDiv2.style.cssText = 'width:100%; height:50%'
    document.body.appendChild(plotDiv2)


    const progressData = [
        {
            x: [],
            y: [],
            type: 'scatter',
            name: 'hp',
            marker: {
                color: 'rgb(200, 50, 50)'
            }
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            name: 'gold',
            marker: {
                color: 'rgb(200, 200, 50)'
            }
        }
    ]

    let allDragons = []
    const dragonData = [
        {
            x: [],
            y: [],
            type: 'bar',
            name: `tier1`
        }
    ]

    for (let i = 1; i <= 50; i++) {
        const stageItems = window.GD.generateStageItems(i)
        progressData[0].x.push(i)
        progressData[0].y.push(stageItems.reduce((acc, item) => {
            return acc + item.health
        }, 0))

        const additional = typeof progressData[1].y[i-2] === "undefined" ? 0 : progressData[1].y[i-2]
        progressData[1].x.push(i)
        progressData[1].y.push(stageItems.reduce((acc, item) => {
            return acc + item.drops.gold
        }, 0) + additional)


        //
        //
        const dragons = stageItems.reduce((acc, item) => {
            if (item.drops.egg) {
                acc.push(item.drops.egg.drops.dragon)
            }
            return acc
        }, [])
        allDragons = allDragons.concat(dragons)
        const maxTier = dragons.reduce((acc, item) => { return  item.tier > acc ? item.tier : acc }, 0)
        if (maxTier > dragonData.length) {
            dragonData.push({
                x: [],
                y: [],
                type: 'bar',
                name: `tier${dragonData.length+1}`
            })
        }
        dragonData.forEach((trace, tierIdx) => {
            trace.x.push(i)
            trace.y.push(allDragons.filter(d => d.tier === tierIdx+1).length)
        })
    }

    Plotly.plot(plotDiv, progressData, {
        yaxis: {
            type: 'log',
            autorange: true
        }
    })

    Plotly.plot(plotDiv2, dragonData, {barmode: 'stack'})
}