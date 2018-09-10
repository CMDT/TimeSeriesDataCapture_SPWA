app.service('timeSeriesGraphServiceV2', ['$log', '$state', '$filter', 'timeSeriesAnnotationService', 'timeSeriesTrendService', 'annotationPreviewService', 'annotationsService', function ($log, $state, $filter, timeSeriesAnnotationService, timeSeriesTrendService, annotationPreviewService, annotationsService) {

    var self = this;

    var data;

    var annotationInEdit;

    var activeRunId, activeColumn;

    var margin, width, height;

    var offsetLine;

    var x, y, z;

    var xAxis, yAxis;

    var offsetVector, currentVector;

    var zoom;

    var svg, graph;

    var annotation, annotationControl

    var xLock, yLock;

    var options;

    self.graphInitialize = function (graphData, options) {
        ctrlDown = false;
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

        if (options.axisLock) {
            axisLockInitialize();
        }

        if(options.annotation){
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

    function calculateXDomain(scale,data){
        scale.domain([
            d3.min(data, function(d){ return d.x; }),
            d3.max(data, function(d){ return d.x; })
        ])
    }

    function calculateYDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) { return d.y; }),
            d3.max(data, function (d) { return d.y; })
        ])
    }

    function annotationRender(t){
        var xt = currentVector.rescaleX(x);
        var yt = currentVector.rescaleY(y);

        var id = annotationControl.select('g').attr('id');
        annotationControl.selectAll('g')
            .each(function(d){
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                var annotationBadge
            })
    }




}])