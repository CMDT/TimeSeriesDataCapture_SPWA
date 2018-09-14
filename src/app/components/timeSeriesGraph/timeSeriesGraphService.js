app.service('timeSeriesGraphService', ['$log', '$state', '$filter', 'timeSeriesAnnotationService', 'timeSeriesTrendService', 'annotationPreviewService', 'annotationsService','authenticationService', function ($log, $state, $filter, timeSeriesAnnotationService, timeSeriesTrendService, annotationPreviewService, annotationsService, authenticationService) {

    var self = this;
    var annotationInEdit;
    var activeRunId;
    var activeColumn;

    var activeOffsetVector = undefined;
    var activeViewVector = undefined;

    var user = true;

    // set the dimensions and margins of the graph
    var margin;
    var width;
    var height;

    var graphOptions;

    var trendLineColors = ['#8cc2d0', '#152e34']

    var circleX;
    var circleY;

    // set the ranges
    var x;
    var y;
    var z;

    var xAxis;
    var yAxis;

    var endZoomVector;
    var currentVector;

    var ctrlDown = false;

    var zoom;

    var svg;

    var graph;

    var annotationLabelGroup;
    var annotationGroup;

    var yLock;
    var xLock;

    var annotationAdd;

    var offsetLine;

    var keepState;

    function annotationAddNew(id, time, description) {

        $log.log('adding annotation');

        var newAnnotation = timeSeriesAnnotationService.addAnnotation(activeRunId, id, { Time: time, description: description, groupId: activeRunId }, undefined);
        annotationsService.addAnnotations(activeRunId, [{ id: newAnnotation.id, description: newAnnotation.data.description, xcoordinate: newAnnotation.data.Time }]);
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
        annotationClick(newAnnotation);
    }

    self.setActiveRun = function (id) {
        activeRunId = id;
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
    }

    self.getActiveRun = function () {

        return activeRunId;
    }

    self.setActiveColumn = function (column) {
        var activeTrend = column.split('+');
        svg.select('.y-label').text(activeTrend[1]);
        activeColumn = column;
    }

    self.getActiveColumn = function () {
        return activeColumn;
    }

    function graphInit(options) {
        $log.log(options);
        graphOptions = options

        keepState = options.hasOwnProperty('state') ? options.state : false;
        var w = options.hasOwnProperty('width') ? options.width : 1300;
        var h = options.hasOwnProperty('height') ? options.height : 600;
        var auto = options.hasOwnProperty('autoSize') ? options.autoSize : true;

        trendLineColors = options.hasOwnProperty('palette') ? options.palette : ['#8cc2d0', '#152e34'];

        margin = options.hasOwnProperty('margin') ? options.margin : {
            top: 110,
            right: 170,
            bottom: 70,
            left: 160
        };

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        ctrlDown = false;
        user = true;

        // set the ranges
        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);
        z = d3.scaleOrdinal(trendLineColors);

        xAxis = d3.axisBottom(x);
        yAxis = d3.axisLeft(y).ticks(20);

        endZoomVector = d3.zoomIdentity.scale(1).translate(0, 0);
        currentVector = d3.zoomIdentity.scale(1).translate(0, 0);

        if(auto){
            svg = d3.select('.graph-container')
            .attr("width",'100%')
            .attr("height",'auto')
            .attr("viewBox", "0 0 " + w + ' ' + h)
            .attr("preserveAspectRatio", "xMinYMax meet");
        }else{
            svg = d3.select('.graph-container')
            .attr("width", w)
            .attr("height", h)
            .attr("viewBox", "0 0 " + w + ' ' + h)
            .attr("preserveAspectRatio", "xMinYMax meet");
        }
        



        graph = svg
            .append("g")
            .attr('class', 'graph')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "end")
            .attr("x", (width / 2) + margin.left + 100)
            .attr("y", (h - margin.bottom) + 40)
            .text("Time (Seconds)");

        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "end")
            .attr("y", margin.left-100)
            .attr("x", -height / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("");

        zoom = d3.zoom()
            .on('zoom', zoomed)
            .on('end', zoomedEnd)

        svg.call(zoom)
            .on("dblclick.zoom", null);

        d3.select('body')
            .on('keydown', function () {
                $log.log(d3.event.keyCode);
                if (d3.event.keyCode === 16) {
                    $log.log('keyPress');
                    ctrlDown = true;
                }
            })
        d3.select('body')
            .on('keyup', function () {
                if (d3.event.keyCode === 16) {
                    $log.log('keyUp');
                    ctrlDown = false;
                }
            })

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        annotationLabelGroup = graph.append('g').attr('class', 'annotationLabel-group');
        annotationGroup = graph.append('g').attr('class', 'annotation-group');

        if (options.hasOwnProperty('lock') && options.lock) {
            yLock = svg.append('g')
                .attr('transform', 'translate(' + (margin.left * 0.85) + ',' + (margin.top * 0.6) + ')')
                .attr('class', 'y-lock')
                .attr('class','md-light')
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

        if (options.hasOwnProperty('annotation') && options.annotation && authenticationService.isAuthenticated()) {

            annotationAdd = svg.append('g')
                .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
                .attr('class', 'annotation-add')

            annotationAdd.append('svg:image')
                .attr('xlink:href', './assets/img/add.svg')
                .attr('width', '30')
                .attr('height', '30')
                .on('click', function () {
                    var xt = currentVector.rescaleX(x);
                    annotationAddNew(undefined, xt.invert(500), '');
                })
        }




        graph.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        graph.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        graph.append('g')
            .attr('class', 'run-group')

        offsetLine = graph.append('g')
            .attr('class', 'offsetLine')
            .append('line')

        annotationAdd = svg.append('g')
            .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
            .attr('class', 'annotation-add')


    }



    self.graphInit = function (options) {
        graphInit(options);
    }




    function calculateXDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) { return d.x; }),
            d3.max(data, function (d) { return d.x; })
        ])
    }

    function calculateYDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) { return d.y; }),
            d3.max(data, function (d) { return d.y; })
        ])
    }



    function extractColumn(data, columnX, columnY) {
        var dataArray = [];
        for (var i = 0, n = data.length; i < n; i++) {
            dataArray.push({
                x: data[i][columnX],
                y: data[i][columnY]
            });
        }

        return dataArray;
    }


    function annotationBadgeRender(annotations, t) {
        annotations = (timeSeriesAnnotationService.getAnnotations(activeRunId));
        var xt = currentVector.rescaleX(x);
        var yt = currentVector.rescaleY(y);

        if (t != undefined) {
            xt = t.rescaleX(x);
            yt = t.rescaleY(y);
        }

        var makeAnnotations = d3.annotation()
            .notePadding(15)
            .type(d3.annotationBadge)
            .accessors({
                x: d => xt(d.Time),
                y: d => -10

            })
            .annotations(annotations)
            .on('subjectclick', annotationClick)
        annotationGroup.call(makeAnnotations);
    }


    function annotationLabelRender(t) {
        var xt = currentVector.rescaleX(x);
        var yt = currentVector.rescaleY(y);

        if (t != undefined) {
            xt = t.rescaleX(x);
            yt = t.rescaleY(y);
        }



        //render annotation label (stop button and arrow)
        if (annotationInEdit != undefined) {
            var id = annotationLabelGroup.select('g').attr('id')
            annotationLabelGroup.selectAll('g')
                .each(function (d) {
                    var image = d3.select(this).select('image');
                    var imageWidth = image.attr('width');
                    var annotationBadge = timeSeriesAnnotationService.getAnnotation(activeRunId, id);
                    var x = xt(annotationBadge.data.Time);
                    image.attr('x', (x - (imageWidth / 2)));
                })
        }

    }

    function annotationDrag(d) {

        annotationLabelGroup.selectAll('g')
            .each(function (d) {
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                image.attr('x', (d3.event.x - (imageWidth / 2)));
            })




        var xt = currentVector.rescaleX(x);
        var Time = xt.invert(d3.event.x);
        annotationInEdit.data.Time = Time;
        annotationBadgeRender([annotationInEdit]);

    }

    self.addTrend = function (id, columnName, data) {

        data = extractColumn(data, 'Time', columnName);
        var trend = timeSeriesTrendService.addTrend(id,columnName, d3.scaleLinear(), d3.scaleLinear(), 'Time', columnName, data);
        trend.scaleY.range([height, 0]);
        calculateYDomain(trend.scaleY, trend.data, 'Y');
        calculateXDomain(x, trend.data)

        var activeTrend = activeColumn.split('+');
      
        if (id === activeTrend[0] && columnName === activeTrend[1]) {
            
            circleX = trend.data[0].x;
            circleY = trend.data[0].y;
            svg.select('.y-label').text(columnName);
            offsetLine.attr('x1', x(trend.data[0].x))
                .attr('y1', y(trend.data[0].y))
                .attr('x2', x(trend.data[0].x))
                .attr('y2', y(trend.data[0].y))
                .style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '2')
        }

        var transition = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);


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
            })

        var trendLength = (timeSeriesTrendService.getTrends().length-1) % trendLineColors.length;
        var trendColour = trendLineColors[trendLength];
        $log.log('TREND COLOUR ' + trendColour)
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
            .style("stroke",trendColour)


        svg.call(zoom).transition()
            .call(zoom.transform, d3.zoomIdentity
                .scale(1)
                .translate(0, 0)
            )
    }

    self.removeTrend = function (id, columnName) {
        $log.log(columnName);
        timeSeriesTrendService.removeTrend(id,columnName);
        var activeTrend = activeColumn.split('+');
        if (id == activeTrend[0] && columnName == activeTrend[1]) {
            circleX = 0;
            circleY = 0;

            offsetLine.attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 0)
        }
        var id = $filter('componentIdClassFilter')(id);
        columnName = $filter('componentIdClassFilter')(columnName);
        graph.select('.run-group').select('.' + id + '.' + columnName).remove();

        svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform, endZoomVector);
    }


    self.transition = function (transitionVector, offsetVector) {

        activeViewVector = transitionVector;
        activeOffsetVector = offsetVector;

        $log.log(transitionVector, "v", offsetVector);
        if (transitionVector != undefined) {
            $log.log('zooming');
            ctrlDown = false;
            svg.call(zoom).transition()
                .duration(1500)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(transitionVector.x, transitionVector.y)
                    .scale(transitionVector.k)

                ).on('end', function () {
                    user = false;
                    var xO = activeOffsetVector.x + activeViewVector.x;
                    var yO = activeOffsetVector.y + activeViewVector.y;


                    svg.call(zoom).transition()
                        .duration(1500)
                        .call(zoom.transform, d3.zoomIdentity
                            .translate(xO, yO)
                            .scale(activeViewVector.k)
                        )
                        .on('end', function () {

                            user = true;
                        })
                })
        }
    }

    self.setOffsetLine = function (data, columnName) {
        for (var i = 0, n = data.length; i < n; i++) {
            if (data[i].id === activeRunId) {
                circleY = data[i].values[0][columnName];
            }
        }
    }


    function zoomedEnd() {

    }

    function zoomed() {
        $log.log(activeRunId);
        var t = d3.event.transform;

        t.k = parseFloat((t.k).toFixed(2));
        t.x = parseFloat((t.x).toFixed(2));
        t.y = parseFloat((t.y).toFixed(2));

        var isZooming = endZoomVector.k != t.k;

        if (graphOptions.hasOwnProperty('lock') && graphOptions.lock) {
            var xIsLocked = (xLock.attr('locked') == 1);
            var yIsLocked = (yLock.attr('locked') == 1);

            t.x = xIsLocked && !isZooming ? endZoomVector.x : t.x;
            t.y = yIsLocked && !isZooming ? endZoomVector.y : t.y;
        }


        var xt = t.rescaleX(x);

        if (annotationInEdit != undefined) {
            annotationBadgeRender([annotationInEdit]);
        } else {
            annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId), t);
        }

        annotationLabelRender(t);

       
        if (ctrlDown || !user) {
            var activeTrend = activeColumn.split('+');
            var id = $filter('componentIdClassFilter')(activeTrend[0]);
            var columnName = $filter('componentIdClassFilter')(activeTrend[1]);

           

            var line = graph.select('.run-group').select('.' + id + '.' + columnName).selectAll('.line');
            var yt;
            if (!line.empty()) {
            
                line.attr('d', function (trend) {
                    yt = t.rescaleY(trend.scaleY);
                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })

                    return line(trend.data)
                });

                offsetLine.attr('x2', xt(circleX))
                    .attr('y2', yt(circleY))

                var xDiffrence = t.x - endZoomVector.x;
                var yDiffrence = t.y - endZoomVector.y;

                var offsetVector = {
                    x: xDiffrence,
                    y: yDiffrence
                }


                if (keepState) {
                    $state.go('.', {
                        offsetVector: JSON.stringify(offsetVector)
                    })
                }


            }





        } else {
            var offsetLineYt;
            graph.select('.axis--x').call(xAxis.scale(xt));
            graph.selectAll('.line')
                .attr('d', function (trend) {

                    var yt = t.rescaleY(trend.scaleY);

                    var activeTrend = activeColumn.split('+');
                    if (trend.id === activeTrend[0] && trend.yLabel === activeTrend[1]) {
                        graph.select('.axis--y').call(yAxis.scale(yt));
                        offsetLineYt = t.rescaleY(trend.scaleY);
                    }

                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })


                    return line(trend.data)


                });

            if (offsetLineYt != undefined) {
                offsetLine.attr('x1', xt(circleX))
                    .attr('y1', offsetLineYt(circleY))
                    .attr('x2', xt(circleX))
                    .attr('y2', offsetLineYt(circleY))
            }

            endZoomVector = t;

            var viewVector = JSON.stringify(t);
            var offsetVector = {
                x: 0,
                y: 0
            }
            offsetVector = JSON.stringify(offsetVector);

            if (keepState) {
                $state.go('.', {
                    viewVector: viewVector,
                    offsetVector: offsetVector
                })
            }

        }

        currentVector = t;

    }

    self.clear = function () {

    }



    function lockToggle(lock) {
        var image = lock.select('image');
        var locked = (lock.attr('locked') == 1)
        locked ? image.attr('xlink:href', './assets/img/lock_unlocked.svg') : image.attr('xlink:href', './assets/img/lock_locked.svg')
        locked ? locked = 0 : locked = 1;
        lock.attr('locked', locked);
    }

    function annotationClick(annotation) {
        $log.log(annotation);
        annotationInEdit = annotation;
        showAnnotation(annotation);
    }

    self.getAnnotationInEdit = function () {
        return annotationInEdit;
    }

    self.getActiveRunId = function () {
        return activeRunId;
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
    }

    function annotationClickEdit(annotation) {

        var width = 30;
        var height = 30;
        var xt = currentVector.rescaleX(x);
        var xCor = (xt(annotation.data.Time));
        annotationLabelGroup.selectAll('g').remove();
        annotationLabelGroup.append('g')
            .attr('class', 'move')
            .attr('id', annotation.id)
            .append('svg:image')
            .attr('x', (xCor - (width / 2)))
            .attr('y', -80)
            .attr('xlink:href', './assets/img/arrow_down.svg')
            .attr('width', width)
            .attr('height', height)
            .call(d3.drag()
                .on('drag', annotationDrag)
                .on('end', dragended))


        annotationLabelGroup.append('g')
            .attr('class', 'confirm')
            .append('svg:image')
            .attr('x', (xCor - (width / 2)))
            .attr('y', -110)
            .attr('xlink:href', './assets/img/stop.svg')
            .attr('width', width)
            .attr('height', height)
            .on('click', annotationPosEditConfirm)
    }

    function annotationPosEditConfirm(d) {

        var image = annotationLabelGroup.select('g').select('image');
        var cx = parseFloat(image.attr('x'));
        cx += (parseFloat(image.attr('width'))) / 2;
        $log.log(cx);
        var xt = currentVector.rescaleX(x);
        var Time = xt.invert(cx);
        $log.log(Time);
        annotationInEdit.data.Time = Time
        annotationLabelGroup.selectAll('g').remove();
        showAnnotation();
    }

    function showAnnotation() {

        annotationPreviewService.showAnnotationPreviewPanel(annotationInEdit)
            .then(function (result) {
                annotationClickEdit(result);
                annotationBadgeRender([annotationInEdit]);
            }).catch(function () {
                annotationInEdit = undefined;

                annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
            });

    }



    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
}])