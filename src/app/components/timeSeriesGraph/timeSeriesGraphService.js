app.service('timeSeriesGraphService', ['$log', '$mdDialog', 'timeSeriesAnnotationService', 'selectionService', 'timeSeriesTrendService', function ($log, $mdDialog, timeSeriesAnnotationService, selectionService, timeSeriesTrendService) {


    var self = this;
    var annotationInEdit;
    var activeRunId = '2B497C4DAFF48A9C!160';
    var activeY = 'RTH';
    var runData;
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
    var yAxis = d3.axisLeft(y);

    var endZoomVector = d3.zoomIdentity.scale(1).translate(0, 0);

    var ctrlDown = false;

    var zoom = d3.zoom()
        .on('zoom', zoomed)

    var svg = d3.select('svg')
        .attr("width", '100%')
        .attr("height", 'auto')
        .attr("viewBox", "0 0 1300 600")
        .attr("preserveAspectRatio", "xMinYMax meet");
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var graph = svg
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



    var annotationLabelGroup = graph.append('g').attr('class', 'annotationLabel-group');
    var annotationGroup = graph.append('g').attr('class', 'annotation-group');


    //yLock
    var yLock = svg.append('g')
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



    //xLock
    var xLock = svg.append('g')
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

    //annotation add
    var annotationAdd = svg.append('g')
        .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
        .attr('class', 'annotation-add')

    annotationAdd.append('svg:image')
        .attr('xlink:href', './assets/img/add.svg')
        .attr('width', '30')
        .attr('height', '30')
        .on('click', function () {
            annotationAddNew();
        })

    function annotationAddNew() {
        $log.log('adding annotation');
        var xt = endZoomVector.rescaleX(x);
        var newAnnotation = timeSeriesAnnotationService.addAnnotation(activeRunId, '3423432', { Time: xt.invert(500), description: '' }, undefined);
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId, undefined));
        annotationClick(newAnnotation);
    }







    self.graphInit = function (result) {

        var results = [];

        for (var i = 0, n = result.length; i < n; i++) {
            var resultArray = dataObjectToArray(result[i].runData);
            results.push({ id: result[i].id, values: resultArray });

            var annotationGroupId = timeSeriesAnnotationService.addAnnotationGroup(result[i].id);
            extractAnnotations(annotationGroupId, result[i].annotations);

        }

        runData = results;

        timeSeriesAnnotationService.addAnnotationGroup('2B497C4DAFF48A9C!178');
        timeSeriesAnnotationService.addAnnotation('2B497C4DAFF48A9C!178', '16884', { Time: 4000, description: 'Hi there' }, undefined);

        drawGraph(results);
    }

    function extractAnnotations(annotationGroupId, annotations) {
        var annotationObject = annotations;
        var annotationIds = Object.keys(annotationObject);
        for (var j = 0, m = annotationIds.length; j < m; j++) {
            var data = {
                Time: annotationObject[annotationIds[j]].xcoordinate,
                description: annotationObject[annotationIds[j]].description,
            }
            timeSeriesAnnotationService.addAnnotation(annotationGroupId, annotationIds[j], data, undefined);
        }
    }



    function dataObjectToArray(dataObject) {
        var dataArray = [];
        $log.log(dataObject);
        var objectKeys = Object.keys(dataObject);
        for (var i = 0, n = dataObject[objectKeys[0]].length; i < n; i++) {
            var row = {};
            for (var o = 0, m = objectKeys.length; o < m; o++) {
                row[objectKeys[o]] = Number(dataObject[objectKeys[o]][i]);
            }
            dataArray.push(row);
        }
        return dataArray;
    }



    function drawGraph(runsData) {

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

        $log.log(timeSeriesTrendService.getTrends());
        var runs = runGroup.selectAll(".run")
            .data(timeSeriesTrendService.getTrends())
            .enter().append("g")
            .attr("class", function (d) {
                var id = (d.id.split('!'))
                return 'run' + id[0] + id[1];
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

        var lastTime = - 1;
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

    self.selectedColumn = function (id, columnName) {
        activeRunId = id;

        var data;
        for (var i = 0, n = runData.length; i < n; i++) {
            if (runData[i].id === id) {
                data = runData[i].values;
            }
        }

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
                return 'run' + id[0] + id[1];
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
           
        
    }


    self.redrawGraph = function () {
        activeY = selectionService.selectedToArray(activeRunId)[0];


        var values;
        for (var i = 0, n = runData.length; i < n; i++) {
            if (runData[i].id === activeRunId) {
                values = runData[i].values;
                break;
            }
        }
        calculateYdomain(values);


        var transition = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);


        var line = d3.line()
            .x(function (d) {
                return x(d.Time);
            })
            .y(function (d) {
                return yActive(d[activeY]);
            })

        graph.select('.axis--x').transition(transition).call(xAxis.scale(x));
        graph.select('.axis--y').transition(transition).call(yAxis.scale(yActive));


        var id = activeRunId.split('!');
        graph.select('.run-group').select('.run' + id[0] + id[1]).select('.line')
            .attr('d', function (d) {
                activeY = (selectionService.selectedToArray(d.id)[0]);
                return line(d.values);
            });

        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId), endZoomVector);
        annotationLabelRender(endZoomVector);
    }


    function zoomed() {
        var t = d3.event.transform;

        var isZooming = endZoomVector.k != t.k;

        var xIsLocked = (xLock.attr('locked') == 1);
        var yIsLocked = (yLock.attr('locked') == 1);

        t.x = xIsLocked && !isZooming ? endZoomVector.x : t.x;
        t.y = yIsLocked && !isZooming ? endZoomVector.y : t.y;

        var xt = t.rescaleX(x);



        if (isZooming || ctrlDown) {
            graph.select('.axis--x').call(xAxis.scale(xt));

            graph.selectAll('.line')
                .attr('d', function (trend) {

                    var yt = t.rescaleY(trend.scaleY);
                    if (trend.id === activeRunId) {
                        graph.select('.axis--y').call(yAxis.scale(yt));
                    }
                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })

                    return line(trend.data)


                });
        } else {
            var id = activeRunId.split('!');
            graph.select('.run-group').select('.run' + id[0] + id[1]).selectAll('.line')
                .attr('d', function (trend) {
                    var yt = t.rescaleY(trend.scaleY);
                    var line = d3.line()
                        .x(function (d) { return xt(d.x); })
                        .y(function (d) { return yt(d.y); })

                    return line(trend.data)
                });
        }


        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId), t);
        annotationLabelRender(t);

        endZoomVector = t;

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
        $mdDialog.show({
            templateUrl: 'app/components/timeSeriesGraph/annotationPreview.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,

        }).catch(function (annotation) {
            if (annotation != undefined) {
                $log.log(annotation);
                annotationClickEdit(annotation)
            } else {
                annotationInEdit = undefined;
            }

            annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
        })
    }

    self.setActiveY = function (yColumnName) {
        activeY = yColumnName;
        calculateXdomain(runData);
        calculateYdomain(runData);
        zoomed();
    }

    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
}])