import {URLUtil} from "./utils/URLUtil";

export const Plot = () => {

    document.body.style.cssText = 'margin:0'

    const lala = document.createElement('div')
    lala.style.cssText = 'overflow: auto; top:0px; left:0px; right:0px; position: absolute;'
    document.body.appendChild(lala)

    document.body.removeChild(document.getElementById('gameCanvas'))
    const hpCumulativeGoldPlot = document.createElement('div')
    hpCumulativeGoldPlot.style.cssText = 'width:100%;height:500px'
    // lala.appendChild(hpCumulativeGoldPlot)

    const stageGoldPlot = document.createElement('div')
    stageGoldPlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(stageGoldPlot)

    const clicksPlot = document.createElement('div')
    clicksPlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(clicksPlot)

    const calcDamageToRealDamagePlot = document.createElement('div')
    calcDamageToRealDamagePlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(calcDamageToRealDamagePlot)

    const dragonsPlot = document.createElement('div')
    dragonsPlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(dragonsPlot)

    const hpCumulativeGoldData = [{
            x: [], y: [], type: 'scatter',
            name: 'pack hp',
            marker: { color: 'rgb(200, 50, 50)' }
        }, {
            x: [], y: [], type: 'scatter',
            name: 'acc gold',
            marker: {color: 'rgb(200, 200, 50)'} } ]

    const stageGoldData = [{
        x: [], y: [], type: 'bar',
        name: 'gold/stage',
        marker: { color: 'rgb(230, 230, 20)' } } ]

    const clicksData = [{
            x: [], y: [], type: 'scatter',
            yaxis: 'y2', marker: { color: 'rgb(50, 500, 200)' } } ]

    const calcDamageToRealDamageData = [{
            x: [], y: [], type: 'scatter',
            name: 'calc damage',
            marker: {color: 'rgb(200, 200, 20)'}
        }, {
            x: [], y: [], type: 'scatter',
            name: 'real damage',
            marker: {color: 'rgb(20, 20, 200)'} }]

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
    const getSortedDragonsOfTier = (dragons, tier) => {
        let dragonsOfTier = dragons.filter(d => d.tier === tier)
        dragonsOfTier.sort((a, b) => {
            if (a.level < b.level) return -1
            if (a.level > b.level) return 1
            return 0
        })
        return dragonsOfTier
    }
    const upgradeConcreteDragon = (dragons, tier, level) => {
        for (let i = 0; i < dragons.length; i++) {
            const dragon = dragons[i]
            if (dragon.tier === tier && dragon.level === level) {
                dragon.level += 1
                return
            }
        }
    }
    const maxTierMinLevelStratUpgrade = (dragons, gold) => {
        const tryUpgradeOnTier = (tier, dragons, gold) => {
            let dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
            let targetDragon = dragonsOfTier[0]
            if (targetDragon.level < 25) {
                let price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                while(price <= gold) {
                    gold -= price
                    verbose&&console.log(`upg ${targetDragon.tier}-${targetDragon.level} for ${price}, balance ${gold}`)
                    upgradeConcreteDragon(dragons, targetDragon.tier, targetDragon.level)
                    dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
                    targetDragon = dragonsOfTier[0]
                    if (targetDragon.level === 25) break
                    price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                }
            }

            if (tier > 1) {
                return tryUpgradeOnTier(tier-1, dragons, gold)
            }
            return gold
        }
        return tryUpgradeOnTier(getMaxTier(dragons), dragons, gold)
    }

    const minTierMinLevelStratUpgrade = (dragons, gold) => {
        const maxTier = getMaxTier(dragons)
        const tryUpgradeOnTier = (tier, dragons, gold) => {
            let dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
            let targetDragon = dragonsOfTier[0]
            if (targetDragon.level < 25) {
                let price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                while (price <= gold) {
                    gold -= price
                    verbose && console.log(`upg ${targetDragon.tier}-${targetDragon.level} for ${price}, balance ${gold}`)
                    upgradeConcreteDragon(dragons, targetDragon.tier, targetDragon.level)
                    dragonsOfTier = getSortedDragonsOfTier(dragons, tier)
                    targetDragon = dragonsOfTier[0]
                    if (targetDragon.level === 25) break
                    price = window.GD.getUpgradePrice(targetDragon.tier, targetDragon.level)
                }
            }

            if (tier+1 <= maxTier) {
                return tryUpgradeOnTier(tier+1, dragons, gold)
            }
            return gold
        }
        return tryUpgradeOnTier(1, dragons, gold)
    }

    const strategyExecutor = {
        'minTierMinLevel': minTierMinLevelStratUpgrade,
        'maxTierMinLevel': maxTierMinLevelStratUpgrade
    }
    const strategy = URLUtil.getParameterByName('strat') ? URLUtil.getParameterByName('strat') : 'maxTierMinLevel'
    const maxStage = URLUtil.getParameterByName('maxStage') ? Number.parseInt(URLUtil.getParameterByName('maxStage')) : 40
    const verbose = URLUtil.getParameterByName('verbose') === 'true'
    console.log(`strat: ${strategy}, maxStage: ${maxStage}, verbose: ${verbose}`)

    for (let i = 1; i <= maxStage; i++) {

        //
        // plot hp and gold for each stage
        const stageItems = window.GD.generateStageItems(i)
        const stageGold = stageItems.reduce((acc, item) => { return acc + item.drops.gold }, 0)
        verbose&&console.log(`%c--start stage ${i}: gold: ${stageGold}, sdacha: ${savedGold}, total: ${stageGold + savedGold}`, 'color: #CC0000')
        savedGold += stageGold
        const stageHP = stageItems.reduce((acc, item) => { return acc + item.health }, 0)
        hpCumulativeGoldData[0].x.push(i)
        hpCumulativeGoldData[0].y.push(stageHP)

        const additional = typeof hpCumulativeGoldData[1].y[i-2] === "undefined" ? 0 : hpCumulativeGoldData[1].y[i-2]
        hpCumulativeGoldData[1].x.push(i)
        hpCumulativeGoldData[1].y.push(stageGold + additional)

        stageGoldData[0].x.push(i)
        stageGoldData[0].y.push(stageGold)

        //
        // plot dragons for each stage
        const dragons = stageItems.reduce((acc, item) => {
            if (item.drops.egg) {
                acc.push(item.drops.egg.drops.dragon)
            }
            return acc
        }, [])
        if (dragons.length) {
            verbose&&console.log(`%cnew dragons: ${dragons.map(d => `tier${d.tier}`).join(', ')}`, 'color: #0000CC')
        }
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

        const subStage = 4
        const ssHP = stageHP / subStage
        const ssGold = Math.floor(savedGold / subStage)
        let ss = 0
        while (ss < subStage) {
            const dmg = window.GD.getClickDamage2(allDragons)
            clicksData[0].x.push(i-1 + (ss * (1/subStage)))
            clicksData[0].y.push(ssHP/dmg)

            verbose&&console.log(`%c-substage${ss+1}/${subStage}: gold: ${ssGold}`, 'background: #00AAAA')
            const sdacha = strategyExecutor[strategy](allDragons, ssGold)
            savedGold = savedGold - ssGold + sdacha
            verbose&&console.log(`%c-end substage: sdacha: ${sdacha}`, 'background: #00AAAA')
            ss+=1
        }
        verbose&&console.log(`%cSDACHA substage, balance: ${savedGold}`, 'background: #559999')
        savedGold = strategyExecutor[strategy](allDragons, savedGold)
        verbose&&console.log(`%c--end stage ${i}-----`, 'color: #CC0000')

        calcDamageToRealDamageData[0].x.push(i)
        calcDamageToRealDamageData[0].y.push(window.GD.getTargetDamage(i))

        calcDamageToRealDamageData[1].x.push(i)
        calcDamageToRealDamageData[1].y.push(window.GD.getClickDamage2(allDragons))
    }

    Plotly.plot(hpCumulativeGoldPlot, hpCumulativeGoldData, { title: 'stage hp and cumulative gold(log)', yaxis: { type: 'log', autorange: true } })
    Plotly.plot(stageGoldPlot, stageGoldData, { title: 'gold per stage(log)', yaxis: { type: 'log', autorange: true } })
    Plotly.plot(clicksPlot, clicksData, { title: `clicks with ${strategy} strat` })
    Plotly.plot(calcDamageToRealDamagePlot, calcDamageToRealDamageData, { title: 'real damage to calculated damage(log)', yaxis: { type: 'log', autorange: true } })
    Plotly.plot(dragonsPlot, dragonData, { title: 'cumulative dragons', barmode: 'stack'})
}