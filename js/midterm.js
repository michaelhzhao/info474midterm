'use strict';

let data = "no data"
let pokemonData = "no data"
let svgScatterPlot = "" 
let funcs = ""
let gen = 0
let showingLeg = "all"


const m = {
    width: 1250,
    height: 700,
    marginAll: 70
}

const colors = {
  "Bug": "#4E79A7",
  "Dark": "#A0CBE8",
  "Dragon": "#FCB603",
  "Electric": "#F28E2B",
  "Fairy": "#FFBE&D",
  "Fighting": "#59A14F",
  "Fire": "#8CD17D",
  "Flying": "#DAF7DA",
  "Ghost": "#B6992D",
  "Grass": "#499894",
  "Ground": "#86BCB6",
  "Ice": "#86BCB6",
  "Normal": "#E15759",
  "Poison": "#FF9D9A",
  "Psychic": "#79706E",
  "Rock": "#66450B",
  "Steel": "#BAB0AC",
  "Water": "#D37295"
}

svgScatterPlot = d3.select('body')
  .append('svg')
  .attr('width', m.width)
  .attr('height', m.height)

d3.csv("./data/pokemon.csv")
  .then((csvData) => {
    data = csvData
    pokemonData = csvData
    funcs = makeAxesAndLabels()
    populateDropdown()
    makeScatterPlot(0, showingLeg, funcs)
  })
.then(() => {
    d3.select('#dropdown').on('change', function() {
        gen = parseInt(d3.select(this).property('value'))
        makeScatterPlot(gen, showingLeg, funcs)
      })
    d3.selectAll('.leg-radio').on('change', function() {
      let cb = d3.select(this)
      showingLeg = cb.property('value')
      makeScatterPlot(gen, showingLeg, funcs)
      })
    })


function populateDropdown() {
  let extent = d3.extent(pokemonData.map((row) => row["Generation"]))
  d3.select('#dropdown').selectAll("option")
    .data(d3.range((parseInt(extent[0]) - 1), (parseInt(extent[1]) + 1), 1))
  .enter().append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) { if (d == 0) {
                          return "All"}
                       return d; })
}


function parseCheckboxes(val) {
  if (val == 'all') {
    return 'll'
  }
  if (val == 'all' && checked) {
    select.checked = true
    nonselect.checked = true
  }
  if (select.checked && nonselect.checked) {
    all.checked = true
    return 'all'
  }
  else {
    all.checked = false
    if (nonselect.checked) {
      return 'false'
    }
    if (!nonselect.checked && !select.checked) {
      return 'none'
    }
    return 'true'
  }
}


function makeAxesAndLabels() {
    const fertilityData = data.map((row) => parseFloat(row["Sp. Def"]))
    const lifeData = data.map((row) => parseFloat(row["Total"]))
    const limits = findMinMax(fertilityData, lifeData)

    const funcs = drawAxes(limits, "Sp. Def", "Total", svgScatterPlot, 
        {min: m.marginAll, max: m.width - m.marginAll}, {min: m.marginAll, max: m.height - m.marginAll})
    makeLabels()

    return funcs
}
  

function makeScatterPlot(gen, showingLeg, funcs) {
  filterByGen(gen)
  filterByLeg(showingLeg)
  plotData(funcs)

  d3.select('#title').remove()
  svgScatterPlot.append('text')
    .attr('x', 50)
    .attr('y', 30)
    .attr('id', "title")
    .style('font-size', '18pt')
    .text("Pokemon by Total Stats and Sp. Def")
}

function filterByGen(gen) {
  if (gen == 0) {
    data = pokemonData
  }
  else {
    data = pokemonData.filter((row) => row['Generation'] == gen)
  }
}

function filterByLeg(leg) {
  if (leg == 'none') {
    data = []
  }
  if (leg == 'true') {
    data = data.filter((row) => row['Legendary'] == "TRUE")
  }
  if (leg == 'false') {
    data = data.filter((row) => row['Legendary'] == 'FALSE')
  }
  else {
    data = data
  }
}

function makeLabels() {
  svgScatterPlot.append('text')
    .attr('x', 50)
    .attr('y', 30)
    .attr('id', "title")
    .style('font-size', '18pt')
    .text("Pokemon by Total Stats and Sp. Def")

  svgScatterPlot.append('text')
    .attr('x', 570)
    .attr('y', 670)
    .attr('id', "x-label")
    .style('font-size', '12pt')
    .text('Special Defense')

  svgScatterPlot.append('text')
    .attr('transform', 'translate(20, 370)rotate(-90)')
    .style('font-size', '12pt')
    .text('Total Stats')
}

function plotData(map) {
  let xMap = map.x
  let yMap = map.y

  let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

  let update = svgScatterPlot.selectAll('circle')
    .data(data)

  update
    .enter()
    .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 8)
      .style('stroke', '#025D8C')
      .style('stroke-width', '1')
      .style('fill', function(d) {return colors[d['Type 1']];})
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9)
        div.html(d['Name'] + "<br/>" + "<span class='subtext'>" + d["Type 1"] + "<br/>" + d["Type 2"] + "</span>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0)
      })
  update.exit().remove()
  update.transition().duration(500)
    .attr('cx', xMap)
    .attr('cy', yMap)
    .attr('r', 8)
    .style('fill', function(d) {return colors[d['Type 1']];})
  drawLegend();
}

function drawLegend() {
  let legend = svgScatterPlot.selectAll(".legend")
  .data(Object.keys(colors))
.enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
  .attr("x", m.width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d) { return colors[d]; });

legend.append("text")
  .attr("x", m.width - 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d) { return d;})
}


function drawAxes(limits, x, y, svg, rangeX, rangeY) {
  let xValue = function(d) { return + d[x] }

  let xScale = d3.scaleLinear()
    .domain([limits.xMin - 20, limits.xMax + 10]) 
    .range([rangeX.min, rangeX.max])

  let xMap = function(d) { return xScale(xValue(d)) }
  let xAxis = d3.axisBottom().scale(xScale)
  svg.append("g")
    .attr('transform', 'translate(0, ' + rangeY.max + ')')
    .attr('id', "x-axis")
    .style('font-size', '9pt')
    .call(xAxis)

  let yValue = function(d) { return + d[y]}

  let yScale = d3.scaleLinear()
    .domain([limits.yMax, limits.yMin - 50]) 
    .range([rangeY.min, rangeY.max])

  let yMap = function (d) { return yScale(yValue(d)) }

  let yAxis = d3.axisLeft().scale(yScale)
  svg.append('g')
    .attr('transform', 'translate(' + rangeX.min + ', 0)')
    .attr('id', "y-axis")
    .style('font-size', '9pt')
    .call(yAxis)

  return {
    x: xMap,
    y: yMap,
    xScale: xScale,
    yScale: yScale
  }
}


function findMinMax(x, y) {

  let xMin = d3.min(x)
  let xMax = d3.max(x)

  let yMin = d3.min(y)
  let yMax = d3.max(y)

  return {
    xMin : xMin,
    xMax : xMax,
    yMin : yMin,
    yMax : yMax
  }
}