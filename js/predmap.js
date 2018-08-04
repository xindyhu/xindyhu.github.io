/**
 * Created by cindyhu on 8/4/18.
 */
var pmwidth = 1000,
    pmheight = 600;

var predmapsvg = d3.select("#predmap").append("svg")
    .attr("width", pmwidth)
    .attr("height", pmheight);

var projection = d3.geoAlbers();

// define path generator
var path = d3.geoPath()
    .projection(projection);

var ext_color_domain = [0, 5, 10, 150];
var color_domain = [0, 5, 10, 150, 70710000];
var legend_labels = ["< 5", "5-10", "10-150", ">150"];
var colorPredmap = d3.scaleLinear()
    .domain(color_domain)
    .range(["green", "yellow", "orange", "red"]);

queue()
    .defer(d3.json, "data/us-states.json")
    .defer(d3.csv, "data/arsenic_obs_unique.csv")
    .defer(d3.csv, "data/arsenic_pred_unique.csv")
    .await(createVisualization);

function createVisualization(error, stateJson, obs, pred) {
    var vis=this;
    var usStates = stateJson.features;
    obs.forEach(function (d) {
        d['LatitudeMeasure'] = +d['LatitudeMeasure'];
        d['LongitudeMeasure'] = +d['LongitudeMeasure'];
        d['conc'] = +d['conc'];
    });
    pred.forEach(function (d) {
        d['LatitudeMeasure'] = +d['LatitudeMeasure'];
        d['LongitudeMeasure'] = +d['LongitudeMeasure'];
        d['conc'] = +d['conc'];
    });
    predmapsvg.selectAll("path")
        .data(usStates)
        .enter().append("path")
        .attr("d", path)
        .style('fill', 'none')
        .style('stroke', 'white');
    //clear existing circles

    //add new circles
    vis.selectdata=obs;
    vis.selected = 'observed';
    predmapsvg.selectAll("circle")
        .data(vis.selectdata)
        .enter()
        .append("circle")
        .transition()
        .attr("cx", function (d) {
            return projection([d.LongitudeMeasure, d.LatitudeMeasure])[0];
        })
        .attr("cy", function (d) {
            return projection([d.LongitudeMeasure, d.LatitudeMeasure])[1];
        })
        .attr("r", 1)
        .style("fill", function (d) {
            return colorPredmap(d.conc);
        });

    $('input[name=pred-model]').click(function(){
        predmapsvg.selectAll("circle").remove();
        vis.selected = this.value;
        console.log(vis.selected);
        if (vis.selected==='predicted')
        {
            vis.selectdata=pred;
            predmapsvg.selectAll("circle")
                .data(vis.selectdata)
                .enter()
                .append("circle")
                .transition()
                .attr("cx", function (d) {
                    return projection([d.LongitudeMeasure, d.LatitudeMeasure])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.LongitudeMeasure, d.LatitudeMeasure])[1];
                })
                .attr("r", 1)
                .style("fill", function (d) {
                    return colorPredmap(d.conc);
                });
        }
        else if (vis.selected==='observed')
        {
            vis.selectdata=obs;
            predmapsvg.selectAll("circle")
                .data(vis.selectdata)
                .enter()
                .append("circle")
                .transition()
                .attr("cx", function (d) {
                    return projection([d.LongitudeMeasure, d.LatitudeMeasure])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.LongitudeMeasure, d.LatitudeMeasure])[1];
                })
                .attr("r", 1)
                .style("fill", function (d) {
                    return colorPredmap(d.conc);
                });
        }
    });

    var legend = predmapsvg.selectAll("g.legend")
        .data(ext_color_domain)
        .enter().append("g")
        .attr("class", "legend");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
        .attr("x", 820)
        .attr("y", function(d, i){return pmheight -80- (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d) { return colorPredmap(d); })
        .style("opacity", 0.8);

    legend.append("text")
        .attr("x", 850)
        .attr("y", function(d, i){ return pmheight -80- (i*ls_h) - ls_h - 4;})
        .text(function(d, i){ return legend_labels[i]; })
        .style("fill",'white');

    legend.append("text")
        .attr("x", 820)
        .attr("y", 400)
        .text('Arsenic concentration (ppb)')
        .style('fill','white');

}
