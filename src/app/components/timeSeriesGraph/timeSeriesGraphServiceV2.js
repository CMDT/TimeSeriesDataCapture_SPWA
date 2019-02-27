app.service('timeSeriesGraphServiceV2', ['$log', '$state', '$filter', 'timeSeriesAnnotationService', 'timeSeriesTrendService', 'annotationPreviewService', 'annotationsService', 'graphEventEmitterService', 'activeColumn', function ($log, $state, $filter, timeSeriesAnnotationService, timeSeriesTrendService, annotationPreviewService, annotationsService, graphEventEmitterService, activeColumn) {

    var self = this;

    //data for all graphs currently being viewed
    var data;

    //current activeRun and activeColumn
    var activeRunId, activeColumn;



    //graph margins, width and height
    var margin, width, height;

    //offsetline to show how much the active trend is offset
    var offsetLine;

    //d3 x and y scales
    var x, y, z;

    //d3 x and y axises
    var xAxis, yAxis;

    //offsetVector : vector(scale,x,y) for the active trend (which can be offset)
    //currentVector : vector(scale,x,y) for the non-active trends 
    var offsetVector, currentVector;

    //d3 zoom
    var zoom;

    //svg and graph html node
    var svg, graph;

    //xLock button to lock the x-axis
    //yLock button to lock the y-axis
    var xLock, yLock;

    var trendLineColours = ['#8cc2d0', '#152e34'];

    //options set for the graph
    var options;

    //who is panning/zooming the graph (user or code)
    var user;

    //objects holds all annotations to render
    var annotationGroupObject;
    //add new annotation button
    var annotationAddButton;

    //init the graph (setting everything up)
    //
    // GRAPHDATA:
    //          graphData is an array of runs, each element is an object holding an array of 'values'
    //          each element in values must be an object having 2 elements x and y
    //          example:
    //          [{[{x : 0, y:-1}]}]
    //
    // GRAPHOPTIONS:
    //         annotation: displays graph annotations (defaults to false)
    //         axisLock : able locks axises (defaults to true)
    //         urlState : maintain graph in url (defaults to false)
    //         height : graph height (defaults to 600px)
    //         width : graph width (deafults to 1300px)
    self.graphInit = function (graphData, graphOptions) {
        console.log(graphOptions)
        ctrlDown = false;
        user = true;
        data = graphData;
        options = graphOptions;

        //setup options
        options.width = options.hasOwnProperty('width') ? options.width : 1300;
        options.height = options.hasOwnProperty('height') ? options.height : 600;
        options.urlState = options.hasOwnProperty('urlState') ? options.urlState : false;
        options.axisLock = options.hasOwnProperty('axisLock') ? options.axisLock : true;
        options.annotation = options.hasOwnProperty('annotation') ? options.annotation : false;

        //setup margin
        margin = options.hasOwnProperty('margin') ? options.margin : {
            top: 110,
            right: 170,
            bottom: 70,
            left: 160
        }

        width = options.width - margin.left - margin.right;
        height = options.height - margin.top - margin.bottom;

        //setup d3 scales and ranges 
        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        //setup d3 axis
        xAxis = d3.axisBottom(x);
        yAxis = d3.axisLeft(y);

        //setup vectors to starting vectors
        offsetVector = d3.zoomIdentity.scale(1).translate(0, 0);
        currentVector = d3.zoomIdentity.scale(1).translate(0, 0);

        //setup svg graph container
        svg = d3.select('.graph-container')
            .attr("width", "100%")
            .attr("height", "auto")
            .attr("viewBox", "0 0 " + options.width + ' ' + options.height)
            .attr("preserveAspectRatio", "xMinYMax meet");

        //setup graph
        graph = svg
            .append("g")
            .attr('class', 'graph')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //setup d3 zoom
        zoom = d3.zoom()
            .scaleExtent([0.1, 32])
            .on('zoom', zoomed);

        //disable double click to zoom
        svg.call(zoom)
            .on("dblclick.zoom", null);

        //detect when ctrl key is pressed
        d3.select('body')
            .on('keydown', function () {
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

        //apply clipping path (used to stop graph being render out of the axis bounds)
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        //setup offsetline
        offsetLine = new OffsetLine(graph, 0, 0, 420, 970);

        //append y and x axis
        graph.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        graph.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        graph.append('g')
            .attr('class', 'run-group')

        //setup axis lock
        if (options.axisLock) {
            axisLockInitialize();
        }


        annotationInitialize();

    }

    //craetes two axis locks, one for y and one for x
    function axisLockInitialize() {
        yLock = new Lock('y-lock', svg, 30, 30, (margin.left * 0.85), (margin.top * 0.6));
        xLock = new Lock('x-lock', svg, 30, 30, (width + margin.left * 1.2), (height + margin.top * 0.8));
    }

    //creates annotationGroupObject to hold all annotations
    //creates annotationAddButton to add new annotations =
    function annotationInitialize() {
        annotationGroupObject = new AnnotationGroup(graph, 0, 970);
        annotationAddButton = new AddAnnotationButton(svg, 30, 30, (width + margin.left * 1.2), (margin.top * 0.8));
    }

    //calculate the x domain (largest and smallest values in the x data)
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

    //calculate the y domain (largest and smallest values in the y data)
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


    //extract trend line data
    function extractTrendLineData(runId, columnY) {
        var runData = null;

        for (var i = 0; i < data.length; i++) {
            if (data[i].id === runId) {
                runData = (data[i].runData);
            }
        }


        var xyData = [];

        if (runData) {
            for (var i = 0; i < runData['Time'].length; i++) {
                xyData.push({
                    x: runData['Time'][i],
                    y: runData[columnY][i]
                })
            }
            console.log(xyData);
            return xyData;
        } else {
            throw new Error("data in wrong format");
        }


    }

    //Adds a new trend line
    //  runId which run does the trend belong to
    //  columnY which column does the trend belong to (e.g. voltage) 
    self.addTrend = function (runId, columnY) {
        console.log(`adding tend ${runId} ${columnY}`)
        var trendData = extractTrendLineData(runId, columnY);

        //create new trend
        var trend = timeSeriesTrendService.addTrend(runId, columnY, d3.scaleLinear(), d3.scaleLinear(), 'Time', columnY, trendData);
        //setup new trend range
        trend.scaleY.range([height, 0]);
        //setup new trends domains
        calculateYDomain(trend.scaleY, trend.data);
        calculateXDomain(x, trend.data);

        //get active trend
        var activeTrendArray = getActiveColumn();

        //if new trend added is the active trend reset offsetLine co-ordinates
        if (runId == activeTrendArray[0] && columnY == activeTrendArray[1]) {

            offsetLine.xcoor = trend.data[0].x;
            offsetLine.ycoor = trend.data[0].y;
        }

        //create linear transition of 750 seconds 
        var transition = d3.transition().duration(750).ease(d3.easeLinear);
        //rescale the axis to show the new trend
        graph.select('.axis--x').transition(transition).call(xAxis.scale(x));
        graph.select('.axis--y').transition(transition).call(yAxis.scale(trend.scaleY));

        //add new trend to the graph DOM
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

        //add trend data to the run 
        run.append('path')
            .attr('class', 'line')
            .attr('d', function (trend) {
                var line = d3.line()
                    .x(function (d) { return x(d.x); })
                    .y(function (d) { return trend.scaleY(d.y); })
                return line(trend.data)
            })
            .style('stroke', trendColour)

        //transition the graph to show the new trend
        svg.call(zoom).transition()
            .call(zoom.transform, d3.zoomIdentity
                .scale(1)
                .translate(0, 0)
            )
    }

    //remove trend
    self.removeTrend = function (id, columnName) {
        timeSeriesTrendService.removeTrend(id, columnName);

        var id = $filter('componentIdClassFilter')(id);
        var columnName = $filter('componentIdClassFilter')(columnName);
        graph.select('.run-group').select('.' + id + '.' + columnName).remove();
    }

    //Transitions the graph and offsets the active trend by the given vectors
    // vector is an object containing 3 elemets : K (scale), x & y
    self.transition = function (viewVector, offsetVector) {


        if (viewVector) {
            svg.call(zoom).transition()
                .duration(1500)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(Number(viewVector.x), Number(viewVector.y))
                    .scale(Number(viewVector.k))
                )
                .on('end', function () {
                    user = false;

                    var x0 = offsetVector.x + viewVector.x;
                    var y0 = offsetVector.y + viewVector.y;

                    svg.call(zoom).transition()
                        .duration(1500)
                        .call(zoom.transform, d3.zoomIdentity
                            .translate(x0, y0)
                            .scale(viewVector.k)
                        ).on('end',function(){
                            user = true;
                        })
                })
        }
    }

    //When user either zooms or pans the graph
    function zoomed() {
        //get the d3 event transformation 
        var t = d3.event.transform;

        //two decimal places only
        t.k = parseFloat((t.k).toFixed(2));
        t.x = parseFloat((t.x).toFixed(2));
        t.y = parseFloat((t.y).toFixed(2));

        //check if user is zooming or panning
        //by checking the scale of the previous vector (current vector) to scale of this vector
        //true if zooming false if not
        var isZooming = currentVector.k != t.k;




        //checks if axis lock is enabled
        if (options.axisLock) {

            //if x axis lock is enabled set x to the pevious vector x component
            t.x = xLock.locked() ? currentVector.x : t.x;
            //if y axis lock is enabled set y to the pevious vector x component
            t.y = yLock.locked() ? currentVector.y : t.y;
        }

        //if ctrl key is pressed or code is transforming the graph
        //the graph is being offset
        if (ctrlDown || !user) {
            offsetting(t);
        } else {
            panning(t);
        }

        //render active trends annotations
        var active = getActiveColumn()
        annotationGroupObject.render(timeSeriesAnnotationService.getAnnotations(active[0]), x, offsetVector);

    }


    //Panning the graph 
    function panning(t) {

        //d3 rescale x scale
        var xt = t.rescaleX(x);
        var yt;

        //rescale the x axis
        graph.select('.axis--x').call(xAxis.scale(xt));

        //for each line (each run column) re-render
        graph.selectAll('.line')
            .attr('d', function (trend) {

                yt = t.rescaleY(trend.scaleY);



                graph.select('.axis--y').call(yAxis.scale(yt));

                offsetLine.renderWhenPanning(xt, yt);
                var line = d3.line()
                    .x(function (d) { return xt(d.x); })
                    .y(function (d) {
                        var ytDy = yt(d.y);
                        console.log()
                        return ytDy;
                    })
                return line(trend.data)
            });

        //set current vector
        currentVector = t;
        // when user pans the offset graph position is reset back to the current vectors positions
        offsetVector = t;

        //update the url state
        $state.go('.', {
            viewVector: JSON.stringify(t),
            offsetVector: JSON.stringify({ x: 0, y: 0 })
        })
    }

    //Offsetting thr active trend
    function offsetting(t) {
        //d3 rescale y axis
        var xt = t.rescaleX(x);

        //get active trend line
        var activeTrendArray = getActiveColumn()

        if (activeTrendArray) {
            var line = graph.select('.run-group').select('.' + $filter('componentIdClassFilter')(activeTrendArray[0]) + '.' + $filter('componentIdClassFilter')(activeTrendArray[1])).selectAll('.line');
            var yt;

            //check if there is a active trend
            if (!line.empty()) {
                //only re-render the active trend
                line.attr('d', function (trend) {
                    yt = t.rescaleY(trend.scaleY);
                    var line = d3.line()
                        .x(function (d) { return xt(d.x) })
                        .y(function (d) { return yt(d.y) })

                    return line(trend.data);
                })

                //find the difference between the offset vector and current vector, to store in the url
                var xDiffrence = t.x - currentVector.x;
                var yDiffrence = t.y - currentVector.y;

                offsetVector = t;

                //update url state
                $state.go('.', {
                    offsetVector: JSON.stringify({ x: xDiffrence, y: yDiffrence })
                })
                //render offsetline
                offsetLine.renderWhenOffsetting(xt, yt);
            }
        }

    }

    //Offsetline used to indicate when distance between the offset active trend and its original position
    //  parentNode : which DOM element to attach the line
    //  xcoor : starting x coordinate of the line (defaults to 0)
    //  ycoor : starting y coordinate of the line (defaults to 0)
    //  boundryHeight : the height of the graph (renders the line only within the axis)
    //  boundryWidth : the width of the graph 
    //  colour : colour of the offsetline (defaults to red)
    //  width : thickness of the offsetline (defaults to 2)
    function OffsetLine(parentNode, xcoor = 0, ycoor = 0, boundyHeight, boundryWidth, colour = '255,0,0', width = '2') {
        this.node = parentNode.append('g').attr('class', 'offset-line').append('line');
        this.xcoor = xcoor,
            this.ycoor = ycoor,
            this.colour = colour,
            this.width = width,
            this.boundryHeight = boundyHeight;
        this.boundryWidth = boundryWidth;
        //renders offset line when user is offsetting
        this.renderWhenOffsetting = function (xScaler, yScaler) {
            var xPoint = xScaler(this.xcoor);
            var yPoint = yScaler(this.ycoor);

            if (yPoint > this.boundryHeight) {
                yPoint = this.boundryHeight;
            } else if (yPoint < 0) {
                yPoint = 0;
            }

            if (xPoint > this.boundryWidth) {
                xPoint = this.boundryWidth;
            } else if (xPoint < 0) {
                xPoint = 0;
            }

            this.node.attr('x2', xPoint)
                .attr('y2', yPoint);
            this.node.style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '2');
        }
        //render offset line when user is panning
        this.renderWhenPanning = function (xScaler, yScaler) {

            var xPoint = xScaler(this.xcoor);
            var yPoint = yScaler(this.ycoor);

            if (yPoint > this.boundryHeight) {
                yPoint = this.boundryHeight;
            } else if (yPoint < 0) {
                yPoint = 0;
            }

            if (xPoint > this.boundryWidth) {
                xPoint = this.boundryWidth;
            } else if (xPoint < 0) {
                xPoint = 0;
            }

            this.node.attr('x1', xPoint)
                .attr('y1', yPoint)
                .attr('x2', xPoint)
                .attr('y2', yPoint);
            this.node.style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '2');
        }
    }

    //Lock button used to maintain lock status of the button
    //  axisLabel : label used to distinguish multiple locks
    //  parentNode : which DOM element to attach the lock
    //  lockWidth : width of the lock button
    //  lockHeight : height of the lock button
    //  transX : x translation of button (used to position the button)
    //  transY : y translation of button 
    function Lock(axisLabel, parentNode, lockWidth, lockHeight, transX, transY) {
        this.lockWidth = lockWidth;
        this.lockHeight = lockHeight;
        this.transX = transX;
        this.transY = transY;
        this.axisLabel = axisLabel;
        //toggles lock button status (locked/unlocked)
        this.lockToggle = function () {
            var lock = parentNode.select('.' + axisLabel);
            var image = lock.select('image');
            var locked = (lock.attr('locked') == 1)
            locked ? image.attr('xlink:href', './assets/img/lock_unlocked.svg') : image.attr('xlink:href', './assets/img/lock_locked.svg')
            locked ? locked = 0 : locked = 1;
            lock.attr('locked', locked);
        }
        this.node = parentNode.append('g').attr('transform', 'translate(' + transX + ',' + transY + ')').attr('class', axisLabel).append('svg:image')
            .attr('xlink:href', './assets/img/lock_unlocked.svg')
            .attr('width', lockWidth)
            .attr('height', lockHeight)
            .attr('locked', 0)
            .on('click', this.lockToggle)
        //returns true if lock is locked, false if unlocked
        this.locked = function () {
            var lock = parentNode.select('.' + axisLabel);
            var locked = (lock.attr('locked') == 1);
            return locked;
        }

    }

    //Annotation Group renders all annotations for the active graph
    // parentNode : which DOM element to attach the annotations
    // xPixelStart : x start position of graph in pixels
    // xPixelEnd : x end position of graph in pixels
    function AnnotationGroup(parentNode, xPixelStart = 0, xPixelEnd) {
        this.group = parentNode.append('g').attr('class', 'annotation-group');
        this.controls = parentNode.append('g').attr('class', 'annotation-control-group');
        this.annotationInEdit = null;
        this.xPixelStart = xPixelStart;
        this.xPixelEnd = xPixelEnd;
        //when an annotation is clicked
        this.annotationClick = function (AnnotationGroup, annotation, axis, vector) {
            var scope = this;
            //get the annotation object (not d3-annotation object)
            annotation = timeSeriesAnnotationService.getAnnotation(annotation.data.groupId, annotation.id);
            //set clicked annotation in edit
            AnnotationGroup.annotationInEdit = annotation;

            //open new panel shwoing annotation and allowing admin users to edit
            annotation.click(AnnotationGroup.controls, axis, vector, function () {
                scope.annotationInEdit = null
                var active = getActiveColumn()
                AnnotationGroup.render(timeSeriesAnnotationService.getAnnotations(active[0]), axis, offsetVector);

            });
        }
        //renders annotations
        //  annotations : which annotations to render
        //  axis : which axis
        //  vector : which vector
        this.render = function (annotations, axis, vector) {
            if (this.annotationInEdit) {
                this.annotationInEdit.annotationLabelRender(this.group, this.controls, axis, vector);
                annotations = [this.annotationInEdit];
            }
            var annotationGroup = (this);
            var xScaler = vector.rescaleX(axis);
            //filters out any annotations off the graph view
            annotations = (this.filterOutBounds(annotations, xScaler));
            var makeAnnotations = d3.annotation()
                .notePadding(15)
                .type(d3.annotationBadge)
                .accessors({
                    x: d => xScaler(d.Time),
                    y: d => -10
                })
                .annotations(annotations)
                .on('subjectclick', function (annotation) {
                    if (!annotationGroup.annotationInEdit) {
                        annotationGroup.annotationClick(annotationGroup, annotation, axis, vector);
                    }
                });
            this.group.call(makeAnnotations);
        }
        //removes any annotations that are off the graph view
        // annotations : array of annotation objects
        // xScaler : scaler to calculate pixel coordinate of each annotation
        this.filterOutBounds = function (annotations, xScaler) {
            var filteredAnnotations = [];
            for (var i = 0; i < annotations.length; i++) {
                if (xScaler(annotations[i].data.Time) > this.xPixelStart && xScaler(annotations[i].data.Time) < this.xPixelEnd) {
                    filteredAnnotations.push(annotations[i]);
                }
            }
            return filteredAnnotations;
        }
    }

    //Add Annotation Button button adds new annotation when clicked
    // parentNode : which DOM element to attach the annotations
    // buttonWidth : width of button in pixels
    // buttonHeight : height of button in pixels
    // transX : x translation of button (used to position the button)
    // transY : y translation of button 
    function AddAnnotationButton(parentNode, buttonWidth, buttonHeight, transX, transY) {
        var AddAnnotationButton = this;
        this.addButton = parentNode.append('g').attr('transform', 'translate(' + transX + ',' + transY + ')')
            .attr('class', 'annotation-add')
            .append('svg:image')
            .attr('xlink:href', './assets/img/add.svg')
            .attr('width', buttonWidth)
            .attr('height', buttonHeight)
            .on('click', function () {
                AddAnnotationButton.click();
            })
        //when button is clicked add new annotation to active run and reset graph view
        this.click = function () {
            var newAnnotation = timeSeriesAnnotationService.addAnnotation(activeRunId, undefined, { Time: 500, description: "", groupId: activeRunId }, undefined);
            annotationsService.addAnnotations(activeRunId, [{ id: newAnnotation.id, description: newAnnotation.data.description, xcoordinate: newAnnotation.data.Time }]);
            parentNode.call(zoom).transition()
                .duration(1500)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(1, 1)
                )
        }
    }

    function getActiveColumn() {
        if (activeColumn.column) {
            var active = activeColumn.column.split("+");
            return active;
        } else {
            return '';
        }
    }


    graphEventEmitterService.subscribeAddTrend(self.addTrend);
    graphEventEmitterService.subscribeRemoveTrend(self.removeTrend);







}])