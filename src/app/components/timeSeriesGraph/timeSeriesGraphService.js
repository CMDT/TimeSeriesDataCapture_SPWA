app.service('timeSeriesGraphService', ['$log', '$mdDialog', 'runRequestService', 'timeSeriesAnnotationService', function ($log, $mdDialog, runRequestService, timeSeriesAnnotationService) {


    var self = this;
    var annotationInEdit;
    var activeRunId = '2B497C4DAFF48A9C!160';
    // set the dimensions and margins of the graph
    var margin = {
        top: 150,
        right: 50,
        bottom: 50,
        left: 100
    }
    var width = 960 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;


    var trendLineColors = ['#8cc2d0', '#152e34']

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleOrdinal(trendLineColors);


    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var endZoomVector = d3.zoomIdentity.scale(1).translate(0, 0);

    var ctrlDown = false;

    var line = d3.line()
        .x(function (d) { return x(d.Time); })
        .y(function (d) { return y(d.RTH); });


    var zoom = d3.zoom()
        .on('zoom', zoomed)



    var svg = d3.select('svg').attr("viewBox", "0 0 960 550")
        .attr("preserveAspectRatio", "xMinYMax meet");
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var graph = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr('class', 'graph')
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    graph.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



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

    getData(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178'])

    function getData(idArray) {
        var getRunPromises = idArray.map(runRequestService.getRun);
        Promise.all(getRunPromises).then(function (result) {
            var results = [];

            for (var i = 0, n = result.length; i < n; i++) {
                var resultArray = dataObjectToArray(result[i].data.runData);
                results.push({ id: result[i].data.id, values: resultArray });

                var annotationGroupId = timeSeriesAnnotationService.addAnnotationGroup(result[i].data.id);
                extractAnnotations(annotationGroupId, result[i].data.annotations);

            }

            timeSeriesAnnotationService.addAnnotationGroup('2B497C4DAFF48A9C!178');
            timeSeriesAnnotationService.addAnnotation('2B497C4DAFF48A9C!178', '16884', { Time: 4000, RTH: 0, description: 'Hi there' }, undefined);

            drawGraph(results);
        })
    }

    function extractAnnotations(annotationGroupId, annotations) {
        var annotationObject = annotations;
        var annotationIds = Object.keys(annotationObject);
        for (var j = 0, m = annotationIds.length; j < m; j++) {
            var data = {
                Time: annotationObject[annotationIds[j]].xcoordinate,
                description: annotationObject[annotationIds[j]].description,
                RTH: 0
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
        var xDomain = [
            d3.min(runsData, function (c) { return d3.min(c.values, function (d) { return d.Time }) }),
            d3.max(runsData, function (c) { return d3.max(c.values, function (d) { return d.Time }) })
        ];
        x.domain(d3.extent(xDomain));
        z.domain(runsData.map(function (r) { return r.id }))

        y.domain([
            d3.min(runsData, function (c) { return d3.min(c.values, function (d) { return d.RTH; }); }),
            d3.max(runsData, function (c) { return d3.max(c.values, function (d) { return d.RTH; }); })
        ]);

        $log.log(runsData);

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
            .data(runsData)
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
            .attr("d", function (d) { return line(d.values); })
            .style("stroke", function (d) { return z(d.id); })
        annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
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



    function zoomed() {
        var t = d3.event.transform;

        var isZooming = endZoomVector.k != t.k;

        var xIsLocked = (xLock.attr('locked') == 1);
        var yIsLocked = (yLock.attr('locked') == 1);

        t.x = xIsLocked && !isZooming ? endZoomVector.x : t.x;
        t.y = yIsLocked && !isZooming ? endZoomVector.y : t.y;

        var xt = t.rescaleX(x);
        var yt = t.rescaleY(y);

        var line = d3.line()
            .x(function (d) {
                return xt(d.Time);
            })
            .y(function (d) {
                return yt(d.RTH);
            })

        if (isZooming || ctrlDown) {
            graph.select('.axis--x').call(xAxis.scale(xt));
            graph.select('.axis--y').call(yAxis.scale(yt));
            graph.selectAll('.line')
                .attr('d', function (d) {
                    return line(d.values);
                });
        } else {
            var id = activeRunId.split('!');
            graph.select('.run-group').select('.run' + id[0] + id[1]).select('.line')
                .attr('d', function (d) {
                    return line(d.values);
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
            .attr('y', annotation._y - 70)
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
            .attr('y', annotation._y - 110)
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

    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
}])