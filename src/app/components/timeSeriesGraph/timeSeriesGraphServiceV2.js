app.service('timeSeriesGraphServiceV2', ['$log', '$state', '$filter', 'timeSeriesAnnotationService', 'timeSeriesTrendService', 'annotationPreviewService', 'annotationsService', function ($log, $state, $filter, timeSeriesAnnotationService, timeSeriesTrendService, annotationPreviewService, annotationsService) {

    var self = this;

    var data;

    var annotationInEdit;

    var activeRunId, activeColumn;

    var margin, width, height;

    var offsetLine;

    var offsetLineCoordinates;

    var x, y, z;

    var xAxis, yAxis;

    var offsetVector, currentVector;

    var zoom;

    var svg, graph;

    var annotations, annotationControls

    var xLock, yLock;

    var trendLineColours;

    var options;

    var user;

    self.graphInitialize = function (graphData, options) {
        ctrlDown = false;
        user = true;
        data = graphData;
        options = options;

        options.width = options.hasOwnProperty('width') ? options.width : 1300;
        options.height = options.hasOwnProperty('height') ? options.height : 600;
        options.urlState = options.hasOwnProperty('urlState') ? options.urlState : false;
        options.axisLock = options.hasOwnProperty('axisLock') ? options.axisLock : false;
        options.annotation = options.hasOwnProperty('annotation') ? options.annotation : false;

        margin = options.hasOwnProperty('margin') ? options.margin : {
            top: 110,
            right: 170,
            bottom: 70,
            left: 160
        }

        width = options.width - margin.left - margin.right;
        height = options.height = margin.top - margin.bottom;

        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        xAxis = d3.axisBottom(x);
        yAxis = d3.axisLeft(y);

        offsetVector = d3.zoomIdentity.scale(1).translate(0, 0);
        currentVector = d3.zoomIdentity.scale(1).translate(0, 0);

        svg = d3.select('.graph-container')
            .attr("width", w)
            .attr("height", h)
            .attr("viewBox", "0 0 " + w + ' ' + h)
            .attr("preserveAspectRatio", "xMinYMax meet");

        graph = svg
            .append("g")
            .attr('class', 'graph')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        zoom = d3.zoom()
            .on('zoom', zoomed);

        svg.call(zoom)
            .on("dblclick.zoom", null);

        d3.select('body')
            .on('keydown', function () {
                $log.log(d3.event.keyCode);
                if (d3.event.keyCode === 16) {
                    ctrlDown = true;
                }
            });

        d3.select('body')
            .on('keyup', function () {
                if (d3.event.keyCode === 16) {
                    ctrlDown = false;
                }
            });

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        offsetLine = graph.append('g')
            .attr('class', 'offset-line')
            .append('line');

        offsetLineCoordinates = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }


        if (options.axisLock) {
            axisLockInitialize();
        }

        if (options.annotation) {
            annotationInitialize();
        }
    }

    function axisLockInitialize() {
        yLock = svg.append('g')
            .attr('transform', 'translate(' + (margin.left * 0.85) + ',' + (margin.top * 0.6) + ')')
            .attr('class', 'y-lock')
            .attr('locked', 0)

        yLock.append('svg:image')
            .attr('xlink:href', './assets/img/lock_unlocked.svg')
            .attr('width', '30')
            .attr('height', '30')
            .on('click', function () {
                lockToggle(yLock);
            });

        xLock = svg.append('g')
            .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (height + margin.top * 0.8) + ')')
            .attr('class', 'x-lock')
            .attr('locked', 0)

        xLock.append('svg:image')
            .attr('xlink:href', './assets/img/lock_unlocked.svg')
            .attr('width', '30')
            .attr('height', '30')
            .on('click', function () {
                lockToggle(xLock);
            });
    }

    function annotationInitialize() {
        annotations = graph.append('g').attr('class', 'annotation-group');
        annotationControls = graph.append('g').attr('class', 'annoation-control-group');

        annotationAdd = svg.append('g')
            .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
            .attr('class', 'annotation-add');

        annotationAdd.append('svg:image')
            .attr('xlink:href', './assets/img/add.svg')
            .attr('width', '30')
            .attr('height', '30')
            .on('click', function () {
                var xt = currentVector.rescaleX(x);
                annotationAddNew(undefined, xt.invert(500), '');
            });
    }

    function calculateXDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) {
                return d.x;
            }),
            d3.max(data, function (d) {
                return d.x;
            })
        ])
    }

    function calculateYDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) {
                return d.y;
            }),
            d3.max(data, function (d) {
                return d.y;
            })
        ])
    }

    //renders all annotations 
    function annotationRender(annotations, t) {
        var xt = currentVector.rescaleX(x);

        var makeAnnotations = d3.annotation()
            .notePadding(15)
            .type(d3.annotationBadge)
            .accessors({
                x: d => xt(d.Time),
                y: d => -10

            })
            .annotations(annotations)
            .on('subjectclick', annotationClick)
        annotations.call(makeAnnotations);
    }

    //renders annotation edit controls
    function annotationControlsRender(t) {
        var xt = currentVector.rescaleX(x);

        var annotationInEditId = annotationControls.select('g').attr('id');
        annotationControls.selectAll('g')
            .each(function (d) {
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                //TAKE A LOOK CAN I USE ANNOTATION IN EDIT INSTEAD
                var annotationInEdit = timeSeriesAnnotationService.getAnnotation(activeRunId, annotationInEditId);
                var x = xt(annotationBadge.data.Time);
                image.attr('x', (x - (imageWidth / 2)));
            })
    }

    //drags annotation in edit
    function annotationInEditDrag() {
        annotationControls.selectAll('g')
            .each(function (d) {
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                image.att('x', (d3.event.x - (imageWidth / 2)));
            })

        var xt = currentVector.rescaleX(x);
        var time = xt.invert(d3.event.x);
        annotationInEdit.data.Time = time;
        annotationRender([annotationInEdit],currentVector);
    }

    //extract trend line data
    function extractTrendLineData(runId, columnX, columnY) {
        var runData = data.runId;

        //NEED TO LOOK AT
    }

    //add trend line
    self.addTrend = function (runId, columnX, columnY) {
        var trendData = extractTrendLineData(runId, columnX, columnY);

        var trend = timeSeriesTrendService.addTrend(id, columnY, d3.scaleLinear(), d3.scaleLinear(), 'Time', columnName, trendData);
        trend.scaleY(range[height, 0]);
        calculateYDomain(trend.scaleY, trend.data);
        calculateXDomain(x, trend.data);

        var activeTrend = activeColumn.split('+');

        if (runId == activeTrend[0] && columnY == activeTrend[1]) {
            resetOffsetLine();
            renderOffsetLine();
        }

        var transition = d3.transition().duration(750).ease(d3.easeLinear);
        graph.select('.axis--x').transition(transition).call(xAxis.scale(x));
        graph.select('.axis--y').transition(transition).call(yAxis.scale(trend.scaleY));

        var run = graph.select('.run-group')
            .selectAll('run')
            .data([trend])
            .enter().append('g')
            .attr('class', function (d) {
                var id = $filter('componentIdClassFilter')(d.id);
                var columnName = $filter('componentIdClassFilter')(d.yLabel);
                return 'run ' + id + ' ' + columnName;
            });

        var trendLength = (timeSeriesTrendService.getTrends().length - 1) % trendLineColours.length;
        var trendColour = trendLineColours[trendLength];

        //IS COLUMN NEEDED
        run.append('path')
            .attr('class', 'line')
            .attr('column', function (trend) {
                return trend.yLabel;
            })
            .attr('d', function (trend) {
                var line = d3.line()
                    .x(function (d) { return x(d.x); })
                    .y(function (d) { return trend.scaleY(d.y); })
                return line(trend.data)
            })
            .style('stroke', trendColour)

        svg.call(zoom).transition()
            .call(zoom.transform, d3.zoomIdentity
                .scale(1)
                .translate(0, 0)
            )
    }

    self.removeTrend = function(id,columnName){
        timeSeriesTrendService.removeTrend(id,columnName);

        var activeTrend = activeColumn.split('+');

        if(id ==activeTrend[0] && columnName == activeTrend[1]){
            resetOffsetLine();
            renderOffsetLine();
        }

        var id = $filter('componentIdClassFilter')(id);
        var columnName = $filter('componentIdClassFilter')(columnName);
        graph.select('.run-group').select('.' + id + '.' + columnName).remove();

        //transition removed
    }

    self.transition = function (transitionVector,offsetVector){
        svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform,d3.zoomIdentity
                .translate(transitionVector.x, transitionVector.y)
                .scale(transitionVector.k)
            ).on('end',function(){
                user = false;

                var xO = transitionVector.x + offsetVector.x;
                var yO = transitionVector.y + offsetVector.y;

                svg.call(zoom).transition()
                    .duration(1500)
                    .call(zoom.transform,d3.zoomIdentity
                        .translate(xO,yO)
                        .scale(transitionVector.k)
                ).on('end',function(){
                    user = true;
                })
            });
    }

    function zoomed(){
        var t= d3.event.transform;

        t.k= parseFloat((t.k).toFixed(2));
        t.x = parseFloat((t.x).toFixed(2));
        t.y = parseFloat((t.y).toFixed(2));

        var isZooming = currentVector.k != t.k;

        if(options.lock){
            var xIsLocked = (xLock.attr('locked') == 1);
            var yIsLocked = (yLock.attr('locked') == 1);

            t.x = xIsLocked && !isZooming ? currentVector.x : t.x;
            t.y = yIsLocked && !isZooming ? currentVector.y : t.y;
        }

  

        if(annotationInEdit != undefined){
            annotationRender([annotationInEdit],t);
            annotationControlsRender(t);
        }else{
            annotationRender(timeSeriesAnnotationService.getAnnotations(activeRunId),t);
        }

        if(ctrlDown || !user){

        }else{

        }
    }

    function offsetting(t){
        var xt = t.rescaleX(x);
        var activeTrend = activeColumn.split('+');
        var id = $filter('componentIdClassFilter')(activeTrend[0]);
        var columnName = $filter('componentIdClassFilter')(activeTrend[1]);

        var line = graph.select('.run-group').select('.' + id + '.' + columnName).selectAll('.line');
        var yt;

        if(!line.empty()){
            line.attr('d',function(trend){
                yt = t.rescaleY(trend.scaleY);
                var line =d3.line()
                    .x(function(d){return xt(d.x)})
                    .y(function(d){return yt(d.y)})

                return line(trend.data);
            })

            
        }
    }

    function resetOffsetLine() {
        offsetLineCoordinates.x1 = 0;
        offsetLineCoordinates.x2 = 0;
        offsetLineCoordinates.y1 = 0;
        offsetLineCoordinates.y2 = 0;
    }

    function renderOffsetLine() {
        offsetLine.attr('x1', offsetLineCoordinates.x1)
            .attr('y1', offsetLineCoordinates.y1)
            .attr('x2', offsetLineCoordinates.x2)
            .attr('y2', offsetLineCoordinates.y2)
            .style('stroke', 'rgb(255,0,0)')
            .style('stroke-width', '2')
    }


}])