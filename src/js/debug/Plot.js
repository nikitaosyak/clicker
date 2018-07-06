import {URLParam} from "../utils/URLParam";
import {MathUtil} from "../utils/MathUtil";
import {VirtualPlayThrough} from "./VirtualPlayThrough";

export const Plot = (gameData) => {

    document.body.style.cssText = 'margin:0'

    const lala = document.createElement('div')
    lala.style.cssText = 'overflow: auto; top:0px; left:0px; right:0px; position: absolute;'
    document.body.appendChild(lala)

    document.body.removeChild(document.getElementById('gameCanvas'))
    const hpCumulativeGoldPlot = document.createElement('div')
    hpCumulativeGoldPlot.style.cssText = 'width:100%;height:500px'

    const stageGoldPlot = document.createElement('div')
    stageGoldPlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(stageGoldPlot)

    const clicksPlot = document.createElement('div')
    clicksPlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(clicksPlot)

    const timePlot = document.createElement('div')
    timePlot.style.cssText = 'width:100%;height:500px'
    lala.appendChild(timePlot)

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
        marker: { color: 'rgb(230, 230, 20)' } }, {
        x: [], y: [], type: 'bar',
        name: 'adgold/stage',
        marker: { color: 'rgb(20, 230, 230)' } }]

    const clicksData = [{
            x: [], y: [], type: 'scatter', name: 'substage clicks',
            marker: { color: 'rgb(50, 200, 200)' } },
        {
            x: [], y: [], type: 'scatter', name: 'stage clicks',
            marker: { color: 'rgb(200, 20, 200)' } }]

    const timeData = [{
            x: [], y: [], type: 'bar', name: 'stage minutes',
            marker: { color: 'rgb(50, 200, 200)' } }]
			
    const calcDamageToRealDamageData = [{
            x: [], y: [], type: 'scatter',
            name: 'calc damage',
            marker: {color: 'rgb(200, 200, 20)'}
        }, {
            x: [], y: [], type: 'scatter',
            name: 'real damage',
            marker: {color: 'rgb(20, 20, 200)'} }]

    const dragonData = [{
        x: [],
        y: [],
        type: 'bar',
        name: `tier1`
    }]

    const strategy = URLParam.GET('strat') ? URLParam.GET('strat') : 'maxTierMinLevel'
    const maxStage = URLParam.GET('maxStage') ? Number.parseInt(URLParam.GET('maxStage')) : 40
    const substages = URLParam.GET('substages') ? Number.parseInt(URLParam.GET('substages')) : 4
    const cps = URLParam.GET('cps') ? Number.parseInt(URLParam.GET('cps')) : gameData.clickPerSecs
    const verbose = URLParam.GET('verbose') === 'true'
    console.log(`strat: ${strategy}, maxStage: ${maxStage}, verbose: ${verbose}`)

    const result = VirtualPlayThrough(gameData, strategy, maxStage, substages, cps, verbose).play()
    for (let i = 0; i < result.length; i++) {

        // hp and gold
        hpCumulativeGoldData[0].x.push(i); hpCumulativeGoldData[0].y.push(result[i].stageHp)
        hpCumulativeGoldData[1].x.push(i); hpCumulativeGoldData[1].y.push(result[i].cumulativeGold)
        stageGoldData[0].x.push(i); stageGoldData[0].y.push(result[i].gold)
        stageGoldData[1].x.push(i); stageGoldData[1].y.push(result[i].paidGold)

        //
        // dragons
        if (result[i].dragonsMaxTier > dragonData.length) {
            dragonData.push({
                x: [],
                y: [],
                type: 'bar',
                name: `tier${result[i].dragonsMaxTier}`
            })
        }

        dragonData.forEach((trace, tierIdx) => {
            trace.x.push(i)
            trace.y.push(result[i].dragons.filter(d => d.tier === tierIdx+1).length)
        })

        result[i].substageClicks.forEach((clicks, ss) => {
            clicksData[0].x.push(i-1 + (ss * (1/substages)))
            clicksData[0].y.push(clicks)
        })
        clicksData[1].x.push(i); clicksData[1].y.push(result[i].clicks)
        timeData[0].x.push(i); timeData[0].y.push(result[i].time)
        calcDamageToRealDamageData[0].x.push(i); calcDamageToRealDamageData[0].y.push(result[i].calcDamage)
        calcDamageToRealDamageData[1].x.push(i); calcDamageToRealDamageData[1].y.push(result[i].realDamage)
    }

    console.log('total play time: ', MathUtil.roundToDigit(clicksData[1].y.reduce((acc, current) => acc + current, 0) / 3 / 60 / 60, 2), 'hours')
    Plotly.plot(hpCumulativeGoldPlot, hpCumulativeGoldData, { title: 'stage hp and cumulative gold(log)', yaxis: { type: 'log', autorange: true } })
    Plotly.plot(stageGoldPlot, stageGoldData, { title: 'gold per stage(log)', yaxis: { type: 'log', autorange: true }, barmode: 'stack' })
    Plotly.plot(clicksPlot, clicksData, { title: `clicks with ${strategy} strat`})
    Plotly.plot(timePlot, timeData, { title: `minutes per stage`})
    Plotly.plot(calcDamageToRealDamagePlot, calcDamageToRealDamageData, { title: 'real damage to calculated damage(log)', yaxis: { type: 'log', autorange: true } })
    Plotly.plot(dragonsPlot, dragonData, { title: 'cumulative dragons', barmode: 'stack'})
}