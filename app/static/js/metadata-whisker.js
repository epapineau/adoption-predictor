function whiskerPlot(variable) {
    // Setup plot area
    var width = 600;
    var height = 300;
    var barWidth = 50;
    var margin = {top: 20, right: 10, bottom: 50, left: 50};
    var width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
    var totalWidth = width + margin.left + margin.right;
    var totalheight = height + margin.top + margin.bottom;

    // Add SVG group to page
    var svg = d3.select("#whisker-select-var").append("svg")
            .attr("width", totalWidth)
            .attr("height", totalheight)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // URL for data 
    var url = `/api/train-data/${variable}`;
    
    d3.json(url).then(response => {
        // Sort numbers function
        function sortNumber(a,b) {
            return a - b;
        }

        // Quartile function
        function boxQuartiles(d) {
            return [
                d3.quantile(d, .25),
                d3.quantile(d, .5),
                d3.quantile(d, .75)
            ];
        }

        // Setup a color scale for filling each box
        // var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
        //     .domain(Object.keys(response));

        // Sort group counts so quartile function works
        for(var key in response) {
            var entry = response[key][variable];
            response[key][variable] = entry.sort(sortNumber);
        }

        // Prepare the data for the box plots
        var boxPlotData = [];
        for (var [key, entry] of Object.entries(response)) {
            var record = {};
            var localMin = d3.min(entry[variable]);
            var localMax = d3.max(entry[variable]);

            record["key"] = key;
            record["counts"] = entry[variable];
            record["quartile"] = boxQuartiles(entry[variable]);
            record["whiskers"] = [localMin, localMax];
            // record["color"] = colorScale(key);

            boxPlotData.push(record);
        }
        console.log(boxPlotData)

        // Compute an ordinal xScale for the keys in boxPlotData
        var xScale = d3.scalePoint()
            .domain(Object.keys(response))
            .rangeRound([0, width])
            .padding([0.5]);

        // Compute a global y scale based on the global counts
        // var min = d3.min(globalCounts);
        // var max = d3.max(globalCounts);
        var min = 0;
        var max = 55;
        var yScale = d3.scaleLinear()
            .domain([min, max])
            .range([height, -5]);

        // Setup and append bottom axis
        var tickLabels = ['Same Day','One Week','One Month','2 - 3 Months', 'Not adopted'] 
        var bottomAxis = d3.axisBottom(xScale)
            .tickFormat(function(d,i){ return tickLabels[i] });
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        svg.append("text")
            .attr("transform", `translate(${width/3 + 45}, ${height + margin.top + 20})`)
            // .attr("class", "axisText")
            .text("Adoption Speed");

        // Setup and append left axis
        var leftAxis = d3.axisLeft(yScale);
        svg.append("g")
            .call(leftAxis);
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2) - 52)
            .attr("y", 0 - (margin.left / 2) - 20)
            .attr("dy", "1em")
            // .attr("class", "axisText")
            .text("Pet Age (months)");

        // Setup the group the box plot elements will render in
        var g = svg.append("g")
            .attr("transform", "translate(-25,-2)");

        // Draw the box plot vertical lines
        var verticalLines = g.selectAll(".verticalLines")
            .data(boxPlotData)
            .enter()
            .append("line")
            .attr("x1", function(datum) {
                return xScale(datum.key) + barWidth/2;
            })
            .attr("y1", function(datum) {
                var whisker = datum.whiskers[0];
                return yScale(whisker);
            })
            .attr("x2", function(datum) {
                return xScale(datum.key) + barWidth/2;
            })
            .attr("y2", function(datum) {
                var whisker = datum.whiskers[1];
                return yScale(whisker);
            })
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        // Draw the box plot rectangles
        var rects = g.selectAll("rect")
            .data(boxPlotData)
            .enter()
            .append("rect")
            .attr("width", barWidth)
            .attr("height", function(datum) {
                var quartiles = datum.quartile;
                var height = yScale(quartiles[0]) - yScale(quartiles[2]);
                return height;
            })
            .attr("x", function(datum) {
                return xScale(datum.key);
            })
            .attr("y", function(datum) {
                return yScale(datum.quartile[2]);
            })
            // .attr("fill", function(datum) {
            //     return datum.color;
            // })
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 1);
        
        // Render whisker caps
        var whiskerCaps = [
            // Top whisker
            {x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.whiskers[0]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.whiskers[0]) }},
            // Bottom whisker
            {x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.whiskers[1]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.whiskers[1]) }}
        ];
        
        for(var i=0; i < whiskerCaps.length; i++) {
            var lineConfig = whiskerCaps[i];
          
            // Draw the whiskers at the min for this series
            var whiskerLines = g.selectAll(".whiskers")
                .data(boxPlotData)
                .enter()
                .append("line")
                .attr("x1", lineConfig.x1)
                .attr("y1", lineConfig.y1)
                .attr("x2", lineConfig.x2)
                .attr("y2", lineConfig.y2)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        }

        // Render median line
        var medianLine = [
            // Median line
            {x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.quartile[1]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.quartile[1]) }}
        ];

        for(var i=0; i < medianLine.length; i++) {
            var lineConfig = medianLine[i];
          
            // Draw the whiskers at the min for this series
            var median = g.selectAll(".whiskers")
                .data(boxPlotData)
                .enter()
                .append("line")
                .attr("x1", lineConfig.x1)
                .attr("y1", lineConfig.y1)
                .attr("x2", lineConfig.x2)
                .attr("y2", lineConfig.y2)
                .attr("stroke", "orange")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        }
    });
}

whiskerPlot("Age");