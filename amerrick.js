//requires running local server

var dataset, data;
var n = 120
    duration = 750,
    now = new Date(Date.now() - duration);

var curPos = n;

d3.csv("sensor.csv", function(error, sensor) {
    //read in the data
    if (error) return console.warn(error);
    sensor.forEach(function(d) {
        d.temp = +d.temp;
        d.humidity = +d.humidity;
    });
    dataset = sensor;
    drawVis();
});

var x, y, line;

//populates the data object with the temperature from the first n entries of dataset
function populateData() {
    data = [];
    for (var i = 0; i < d3.min([dataset.length, n]); i++) {
	data.push(dataset[i].temp);
    }
}

var svg = d3.select("svg"),
margin = {top: 0, right: 20, bottom: 20, left: 40},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom,
g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawVis() {

      populateData();

    x = d3.scaleLinear()
      	.domain([1, n - 2])
      	.range([0, width]);

    y = d3.scaleLinear()
      	.domain([d3.min(dataset, function(x) {return x.temp; }), d3.max(dataset, function(x) { return x.temp; })])
      	.range([height, 0]);

    line = d3.line()
      	.curve(d3.curveBasis)
      	.x(function(d, i) { return x(i); })
      	.y(function(d, i) { return y(d); });

    g.append("defs").append("clipPath")
    	.attr("id", "clip")
    	.append("rect")
    	.attr("width", width)
    	.attr("height", height);

    timeX = d3.scaleTime()
      .domain([now - (n - 2) * duration, now - duration])
      .range([0, width]);

    g.append("g")
    	.attr("class", "axis axis--x")
    	.attr("transform", "translate(0," + height + ")")
    	.call(d3.axisBottom(timeX));

    g.append("g")
    	.attr("class", "axis axis--y")
    	.call(d3.axisLeft(y));

    g.append("g")
    	.attr("clip-path", "url(#clip)")
    	.append("path")
    	.datum(data)
    	.attr("class", "line")
    	.transition()
      	.duration(750)
      	.ease(d3.easeLinear)
      	.on("start", tick);

}

function tick() {

    // Push a new data point onto the back.
    if (curPos < dataset.length) {
    	data.push(dataset[curPos].temp);
    }

    // Redraw the line.
    d3.select(this)
    	.attr("d", line)
    	.attr("transform", null);

    // Slide it to the left.
    d3.active(this)
    	.attr("transform", "translate(" + x(0) + ",0)")
    	.transition()
    	.on("start", tick);

      now = new Date();

  timeX = d3.scaleTime()
      .domain([now - (n - 2) * duration, now - duration])
      .range([0, width]);

  d3.select("g.axis--x")
    .transition()
    .duration(750)
    .ease(d3.easeLinear)
    .call(d3.axisBottom(timeX))
    // .attr("transform", "translate(" + x(0) + "," + height + ")");

    // Pop the old data point off the front.
    data.shift();
    curPos++;
}
