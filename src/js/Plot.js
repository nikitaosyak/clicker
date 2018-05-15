
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
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            name: 'clicks',
            yaxis: 'y2',
            marker: {
                color: 'rgb(50, 500, 200)'
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

    let savedGold = 0
    const getMaxTier = (dragons) => {
        return dragons.reduce((acc, item) => { return  item.tier > acc ? item.tier : acc }, 0)
    }
    const doUpgrade = (dragons, gold) => {
        const tryUpgradeOnTier = (tier, dragons, gold) => {
            let dragonsOfTier = dragons.filter(d => d.tier === tier)
            dragonsOfTier.sort((a, b) => {
                if (a.level < b.level) return -1
                if (a.level > b.level) return 1
                return 0
            })
            let price = window.GD.getUpgradePrice(dragonsOfTier[0].tier, dragonsOfTier[0].level)
            while(price <= gold) {
                gold -= price
                let wasUpgrade = false
                dragons.forEach(d => {
                    if (wasUpgrade) return
                    if (d.tier === dragonsOfTier[0].tier && d.level === dragonsOfTier[0].level) {
                        d.level += 1
                        wasUpgrade = true
                    }
                })
                dragonsOfTier = dragons.filter(d => d.tier === tier)
                dragonsOfTier.sort((a, b) => {
                    if (a.level < b.level) return -1
                    if (a.level > b.level) return 1
                    return 0
                })
                price = window.GD.getUpgradePrice(dragonsOfTier[0].tier, dragonsOfTier[0].level)
                // console.log(gold, price)
            }
            // console.log('----')

            if (tier > 1) {
                return tryUpgradeOnTier(tier-1, dragons, gold)
            }
            return gold
        }
        return tryUpgradeOnTier(getMaxTier(dragons), dragons, gold)
    }

    for (let i = 1; i <= 50; i++) {

        //
        // plot hp and gold for each stage
        const stageItems = window.GD.generateStageItems(i)
        const stageGold = stageItems.reduce((acc, item) => { return acc + item.drops.gold }, 0)
        savedGold += stageGold
        const stageHP = stageItems.reduce((acc, item) => { return acc + item.health }, 0)
        progressData[0].x.push(i)
        progressData[0].y.push(stageHP)

        const additional = typeof progressData[1].y[i-2] === "undefined" ? 0 : progressData[1].y[i-2]
        progressData[1].x.push(i)
        progressData[1].y.push(stageGold + additional)

        //
        // plot dragons for each stage
        const dragons = stageItems.reduce((acc, item) => {
            if (item.drops.egg) {
                acc.push(item.drops.egg.drops.dragon)
            }
            return acc
        }, [])
        allDragons = allDragons.concat(dragons)
        const maxTier = getMaxTier(dragons)
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

        const subStage = 3
        const ssHP = stageHP / subStage
        const ssGold = savedGold / subStage
        let ss = 0
        while (ss < subStage) {
            const dmg = window.GD.getClickDamage2(allDragons)
            progressData[2].x.push(i-1 + (ss * (1/subStage)))
            progressData[2].y.push(ssHP/dmg)
            savedGold = savedGold - ssGold + doUpgrade(allDragons, ssGold)
            ss+=1
        }
    }

    Plotly.plot(plotDiv, progressData, {
        yaxis: {
            type: 'log',
            autorange: true
        },
        yaxis2: {
            side: 'right',
            overlaying: 'y'
        }
    })

    Plotly.plot(plotDiv2, dragonData, {barmode: 'stack'})
}