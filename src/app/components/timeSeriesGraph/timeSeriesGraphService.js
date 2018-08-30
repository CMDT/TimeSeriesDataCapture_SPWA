app.service('timeSeriesGraphService', ['$log', '$mdDialog', '$state', 'timeSeriesAnnotationService', 'selectionService', 'timeSeriesTrendService', 'annotationPreviewService', function ($log, $mdDialog, $state, timeSeriesAnnotationService, selectionService, timeSeriesTrendService, annotationPreviewService) {

    var self = this;
    var annotationInEdit;
    var activeRunId;
    var activeColumn;

    var activeOffsetVector = undefined;
    var activeViewVector = undefined;

    var user = true;


    // set the dimensions and margins of the graph
    var margin = {
        top: 110,
        right: 170,
        bottom: 70,
        left: 160
    }
    var width = 1300 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    var trendLineColors = ['#8cc2d0', '#152e34']

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleOrdinal(trendLineColors);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y).ticks(20);

    var endZoomVector = d3.zoomIdentity.scale(1).translate(0, 0);

    var ctrlDown = false;

    var zoom = d3.zoom()
        .on('zoom', zoomed)
        .on('end', zoomedEnd)

    var svg = d3.select('svg')
        .attr("width", '100%')
        .attr("height", 'auto')
        .attr("viewBox", "0 0 1300 600")
        .attr("preserveAspectRatio", "xMinYMax meet");

    var graph;

    var annotationLabelGroup;
    var annotationGroup;

    var yLock;
    var xLock;

    var annotationAdd;

    function annotationAddNew(id, time, description) {
        $log.log('adding annotation');
        $log.log(activeRunId);
        var newAnnotation = timeSeriesAnnotationService.addAnnotation(activeRunId, id, { Time: time, description: description, groupId: activeRunId }, undefined);
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
        annotationClick(newAnnotation);
    }

    self.setActiveRun = function (id) {
        activeRunId = id;
    }

    self.getActiveRun = function () {
        return activeRunId;
    }

    self.setActiveColumn = function (column) {
        activeColumn = column;
    }

    self.getActiveColumn = function () {
        return activeColumn;
    }

    self.graphInit = function (result) {

        graph = svg
            .append("g")
            .attr('class', 'graph')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

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

        annotationAdd = svg.append('g')
            .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
            .attr('class', 'annotation-add')

        annotationAdd.append('svg:image')
            .attr('xlink:href', './assets/img/add.svg')
            .attr('width', '30')
            .attr('height', '30')
            .on('click', function () {
                var xt = endZoomVector.rescaleX(x);
                annotationAddNew('231323', xt.invert(500), '');
            })
    }


    self.drawGraph = function (runsData) {
        $log.log(runsData);
        z.domain(runsData.map(function (r) { return r.id }))

        for (var i = 0, n = runsData.length; i < n; i++) {
            var selectedColumns = selectionService.selectedToArray(runsData[i].id);
            for (var o = 0, m = selectedColumns.length; o < m; o++) {
                var data = extractColumn(runsData[i]['values'], 'Time', selectedColumns[o]);
                var trend = timeSeriesTrendService.addTrend(runsData[i].id, d3.scaleLinear(), d3.scaleLinear(), 'Time', selectedColumns[o], data);
                trend.scaleY.range([height, 0]);
                calculateYDomain(trend.scaleY, trend.data, 'Y');
            }
        }

        var xDomain = [
            d3.min(runsData, function (c) { return d3.min(c.values, function (d) { return d.Time }) }),
            d3.max(runsData, function (c) { return d3.max(c.values, function (d) { return d.Time }) })
        ];
        x.domain(d3.extent(xDomain));

        graph.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        graph.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        var runGroup = graph.append('g')
            .attr('class', 'run-group')

        var runs = runGroup.selectAll(".run")
            .data(timeSeriesTrendService.getTrends())
            .enter().append("g")
            .attr("class", function (d) {
                var id = (d.id.split('!'))
                return 'run _' + id[0] + id[1] + ' ' + d.yLabel;
            })
            .on('click', function (d) {
                activeRunId = d.id;
                annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId))
                d3.select(this).moveToFront();
            });

        runs.append("path")
            .attr("class", "line")
            .attr('column', function (trend) {
                return trend.yLabel;
            })
            .attr("d", function (trend) {
                $log.log(trend);

                var line = d3.line()
                    .x(function (d) { return x(d.x); })
                    .y(function (d) { return trend.scaleY(d.y); })

                return line(trend.data)

            })
            .style("stroke", function (d) { return z(d.id); })
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
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
        var xt = endZoomVector.rescaleX(x);
        var yt = endZoomVector.rescaleY(y);

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
        var xt = endZoomVector.rescaleX(x);
        var yt = endZoomVector.rescaleY(y);

        if (t != undefined) {
            xt = t.rescaleX(x);
            yt = t.rescaleY(y);
        }


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


        var id = annotationLabelGroup.select('g').attr('id');
        var annotationBadge = timeSeriesAnnotationService.getAnnotation(activeRunId, id);

        var xt = endZoomVector.rescaleX(x);
        var Time = xt.invert(d3.event.x);
        annotationBadge.data.Time = Time;
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));

    }

    self.addTrend = function (id,columnName, data) {
        $log.log('DATA', data);
        data = extractColumn(data, 'Time', columnName);
        var trend = timeSeriesTrendService.addTrend(id, d3.scaleLinear(), d3.scaleLinear(), 'Time', columnName, data);
        trend.scaleY.range([height, 0]);
        calculateYDomain(trend.scaleY, trend.data, 'Y');


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
                var id = (d.id.split('!'))
                return 'run _' + id[0] + id[1] + ' ' + d.yLabel;
            })

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

        svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform, d3.zoomIdentity
                .scale(1)
                .translate(0, 0)
            )
    }

    self.removeTrend = function (id,columnName) {
        var id = id.split('!');
        id = '_' + id[0] + id[1]

        graph.select('.run-group').select('.' + id + '.' + columnName).remove();

        svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform, endZoomVector);
    }


    self.transition = function (transitionVector, offsetVector) {
        $log.log('TRANSVECTOR', transitionVector);
        $log.log('OFFSVECOTR', offsetVector);

        activeViewVector = transitionVector;
        activeOffsetVector = offsetVector;

        if (transitionVector != undefined) {
            ctrlDown = true;
            svg.call(zoom).transition()
                .duration(1500)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(transitionVector.x, transitionVector.y)
                    .scale(transitionVector.k)

                ).on('end', function () {
                    ctrlDown = false;
                    user = false;
                    var xO = activeOffsetVector.x + activeViewVector.x;
                    var yO = activeOffsetVector.y + activeViewVector.y;
                    var id = activeRunId.split('!');
                    id = '_' + id[0] + id[1]
                    $log.log('ENDED');
                    svg.call(zoom).transition()
                        .duration(1500)
                        .call(zoom.transform, d3.zoomIdentity
                            .translate(xO, yO)
                            .scale(activeViewVector.k)
                        )
                        .on('end', function () {
                            activeOffsetVector = undefined;
                            user = true;
                        })
                })
        }
    }


    function zoomedEnd() {

    }

    function zoomed() {
        var t = d3.event.transform;
      

        t.k = parseFloat((t.k).toFixed(2));
        t.x = parseFloat((t.x).toFixed(2));
        t.y = parseFloat((t.y).toFixed(2));

        var isZooming = endZoomVector.k != t.k;
        var xIsLocked = (xLock.attr('locked') == 1);
        var yIsLocked = (yLock.attr('locked') == 1);

        t.x = xIsLocked && !isZooming ? endZoomVector.x : t.x;
        t.y = yIsLocked && !isZooming ? endZoomVector.y : t.y;

        var xt = t.rescaleX(x);



        $log.log('ZOOMING', isZooming);
        if (user && (ctrlDown || isZooming)) {

            graph.select('.axis--x').call(xAxis.scale(xt));
            graph.selectAll('.line')
                .attr('d', function (trend) {
                    $log.log(trend);
                    var yt = t.rescaleY(trend.scaleY);
                    var xt = t.rescaleX(x);

                    if (trend.id === activeRunId) {
                        graph.select('.axis--y').call(yAxis.scale(yt));
                    }

                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })


                    return line(trend.data)


                });


            annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId), t);
            annotationLabelRender(t);

            endZoomVector = t;
            $log.log('VIEW', t)
            var viewVector = JSON.stringify(t);
            var offsetVector = {
                x: 0,
                y: 0
            }
            offsetVector = JSON.stringify(offsetVector);
            $state.go('.', {
                viewVector: viewVector,
                offsetVector: offsetVector
            })
        } else {
            var id = activeRunId.split('!');
            id = '_' + id[0] + id[1]


            var line = graph.select('.run-group').select('.' + id + '.' + activeColumn).selectAll('.line');

            if (!line.empty()) {
                line.attr('d', function (trend) {
                    var yt = t.rescaleY(trend.scaleY);
                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })

                    return line(trend.data)
                });

                var xDiffrence = t.x - endZoomVector.x;
                var yDiffrence = t.y - endZoomVector.y;

                var offsetVector = {
                    x: xDiffrence,
                    y: yDiffrence
                }

                $log.log('OFFSET', t)
                $state.go('.', {
                    offsetVector: JSON.stringify(offsetVector)
                })
                annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId), t);
                annotationLabelRender(t);
            }


        }
    }



    function lockToggle(lock) {
        var image = lock.select('image');
        var locked = (lock.attr('locked') == 1)
        locked ? image.attr('xlink:href', './assets/img/lock_unlocked.svg') : image.attr('xlink:href', './assets/img/lock_locked.svg')
        locked ? locked = 0 : locked = 1;
        lock.attr('locked', locked);
    }

    function annotationClick(annotation) {
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
        var xt = endZoomVector.rescaleX(x);
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
        var xt = endZoomVector.rescaleX(x);
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