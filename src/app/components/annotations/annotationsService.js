

angular.module('app').service('annotationsService', annotationsService);

annotationsService.$inject = [
    '$rootScope',
    '$log',
    '$http'
]


function annotationsService(
    $rootScope,
    $log,
    $http
) {
    var self = this;

    self.updateAnnotation = updateAnnotation;
    self.addAnnotations = addAnnotations;
    self.deleteAnnotation = deleteAnnotation;

    function updateAnnotation(componentId, annotationId, annotation) {

        var config = {
            headers: {},
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/components/' + componentId + '/annotations/' + annotationId;
        return $http.put(url, annotation, config)
    }

    function addAnnotations(componentId, annotations) {

        var config = {
            headers: {},
            responseType: 'json'
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/components/' + componentId + '/annotations'

        return $http.post(url, annotations, config);

    }

    function deleteAnnotation(componentId, annotationId) {
        var config = {
            headers: {},
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/components/' + componentId + '/annotations/' + annotationId;

        return $http.delete(url, config)
    }

}