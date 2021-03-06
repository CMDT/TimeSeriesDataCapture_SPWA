app.service('timeSeriesAnnotationService', ['$log', 'annotationPreviewService', function ($log, annotationPreviewService) {



}])


angular.module('app').service('timeSeriesAnnotationService', timeSeriesAnnotationService);

timeSeriesAnnotationService.$inject = [
    '$log',
    'annotationPreviewService'
]

function timeSeriesAnnotationService(
    $log,
    annotationPreviewService
) {
    var self = this;

    var annotationGroups = new Map();

    self.extractAnnotations = extractAnnotations;

    self.addAnnotationGroup = addAnnotationGroup;
    self.removeAnnotationGroup = removeAnnotationGroup;

    self.addAnnotation = addAnnotation;
    self.removeAnnotation = removeAnnotation;
    self.updateAnnotation = updateAnnotation;

    self.getAnnotations = getAnnotations;
    self.getAnnotation = getAnnotation;


    function annotationGroup(id, name, annotations = []) {
        this.id = id;
        this.name = name;
        this.annotations = annotations;
    }

    function annotationBadge(annotationIdGroup, id = createGuid(), data, label = self.titleGen(annotationIdGroup)) {
        this.annotationIdGroup = annotationIdGroup;
        this.id = id;
        this.title = label;
        this.data = data;
        this.note = {
            label: 'Label',
            title: label
        };
        this.subject = {
            text: label,
            y: 'top',
        }
        this.callback = null;
        this.click = function (labelNode, axis, vector, callback) {
            var annotation = this;
            this.callback = callback;
            annotationPreviewService.showAnnotationPreviewPanel(annotation)
                .then(function (result) {
                    annotation.addAnnotationEditButtons(axis, vector, labelNode);
                }).catch(function (error) {
                    callback(this);
                })
        }
        this.addAnnotationEditButtons = function (axis, t, labelNode) {
            var width = 30;
            var height = 30;
            var xt = t.rescaleX(axis);
            var xCor = (xt(this.data.Time));
            labelNode.selectAll('g').remove();
            labelNode.append('g')
                .attr('class', 'move')
                .attr('id', this.id)
                .append('svg:image')
                .attr('x', (xCor - (width / 2)))
                .attr('y', -80)
                .attr('xlink:href', './assets/img/arrow_down.svg')
                .attr('width', width)
                .attr('height', height)

            labelNode.append('g')
                .attr('class', 'confirm')
                .append('svg:image')
                .attr('x', (xCor - (width / 2)))
                .attr('y', -110)
                .attr('xlink:href', './assets/img/stop.svg')
                .attr('width', width)
                .attr('height', height)
        }
        this.annotationLabelRender = function (groupNode, labelNode, xAxis, vector) {
            var annotation = this;
            var xt = vector.rescaleX(xAxis);
            labelNode.selectAll('g')
                .each(function (d) {
                    var image = d3.select(this).select('image');
                    var imageWidth = image.attr('width');
                    var x = xt(annotation.data.Time);
                    image.attr('x', (x - (imageWidth / 2)));
                })

            labelNode.select('.move')
                .call(d3.drag()
                    .on('drag', function () {
                        annotation.annotationDrag(groupNode, labelNode, annotation, xAxis, vector);
                    }))

            labelNode.select('.confirm')
                .on('click', function () {
                    annotation.annotationPosEditConfirm(labelNode, annotation, xAxis, vector);
                })
        }
        this.annotationDrag = function (groupNode, labelNode, annotation, xAxis, vector) {
            var xt = vector.rescaleX(xAxis);
            labelNode.selectAll('g')
                .each(function (d) {
                    var image = d3.select(this).select('image');
                    var imageWidth = image.attr('width');
                    image.attr('x', (d3.event.x - (imageWidth / 2)));
                })
            var Time = xt.invert(d3.event.x);
            Time = Time === 1 ? 0 : Time;

            annotation.data.Time = Time;
            var makeAnnotations = d3.annotation()
                .notePadding(15)
                .type(d3.annotationBadge)
                .accessors({
                    x: d => xt(d.Time),
                    y: d => -10
                })
                .annotations([annotation])
            groupNode.call(makeAnnotations);
        }
        this.annotationPosEditConfirm = function (labelNode, annotation, xAxis, vector) {
            var xt = vector.rescaleX(xAxis);
            var image = labelNode.select('g').select('image');
            var cx = parseFloat(image.attr('x'));
            cx += (parseFloat(image.attr('width'))) / 2;
            var Time = xt.invert(cx);
            annotation.data.Time = Time;
            labelNode.selectAll('g').remove();
            annotation.click(labelNode, xAxis, vector, annotation.callback);
        }
    }

    function extractAnnotations(runs) {
        for (var i = 0, length = runs.length; i < length; i++) {
            self.addAnnotationGroup(runs[i].id);

            var annotationIds = Object.keys(runs[i].annotations);

            for (var j = 0, annotationLength = annotationIds.length; j < annotationLength; j++) {
                createAnnotation(runs[i].id, runs[i]['annotations'][annotationIds[j]]);
            }
        }
    }

    function createAnnotation(annotationGroupId, annotation) {
        var data = {
            Time: annotation.xcoordinate,
            description: annotation.description,
            groupId: annotationGroupId
        }

        self.addAnnotation(annotationGroupId, annotation.id, data, undefined);
    }

    function addAnnotationGroup(id, name, annotations) {
        var newAnnotationGroup = new annotationGroup(id, name, annotations);
        annotationGroups.set(id, newAnnotationGroup);
        return id;
    }

    function removeAnnotationGroup(id) {
        annotationGroups.delete(id);
    }

    function addAnnotation(annotationGroupId, id, data, label) {
        var newAnnotation = new annotationBadge(annotationGroupId, id, data, label);
        var annotationGroup = annotationGroups.get(annotationGroupId);
        annotationGroup.annotations.push(newAnnotation);
        return newAnnotation
    }

    function removeAnnotation(annotationGroupId, annotationId) {
        var annotationGroup = annotationGroups.get(annotationGroupId);
        for (var i = 0, n = annotationGroup.annotations.length; i < n; i++) {
            if (annotationGroup.annotations[i].id === annotationId) {
                annotationGroup.annotations.splice(i, 1);
            }
        }
    }

    function getAnnotations(annotationGroupId) {
        var annotationGroup = annotationGroups.get(annotationGroupId);
        if (annotationGroup != undefined) {
            return annotationGroup.annotations;
        } else {
            return [];
        }
    }

    function getAnnotation(annotationGroupId, annotationId) {
        var annotationGroup = annotationGroups.get(annotationGroupId);

        for (var i = 0, n = annotationGroup.annotations.length; i < n; i++) {
            if (annotationGroup.annotations[i].id === annotationId) {
                return annotationGroup.annotations[i];
            }
        }
    }

    function updateAnnotation(annotationGroupId, annotationId, updateData) {
        var annotationGroup = annotationGroups.get(annotationGroupId);

        for (var i = 0, n = annotationGroup.annotations.length; i < n; i++) {
            if (annotationGroup.annotations[i].id === annotationId) {
                annotationGroup.annotations[i].data = updateData;
                return annotationGroup.annotations[i];
            }
        }
    }

    self.titleGen = function (annotationGroupId) {
        var annotationGroup = annotationGroups.get(annotationGroupId);
        var asciiA = 65;
        var asciiValueNormalized = self.normalizeLength([0, 26], [asciiA, 91], annotationGroup.annotations.length % 26)
        return (String.fromCharCode(asciiValueNormalized) + Math.floor(annotationGroup.annotations.length / 26));
    }

    self.normalizeLength = function (from, to, s) {
        return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
    }

    function createGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}