app.service('tagEditPanelService', ['$log', '$mdDialog','$filter', 'tagPredictionService', function ($log, $mdDialog,$filter, tagPredictionService) {

    var self = this;

    self.showTagEditPanel = function (ev, componentId, tags) {
        $mdDialog.show({
            templateUrl: 'app/components/columnTabPanel/tagEditPanel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
                componentId: componentId,
                tags: tags
            },
            controller: tagEditPanelController
        }).catch(function (result) {
            if (result != undefined) {

            }
        })
    }

    function tagEditPanelController($scope, $mdDialog, JSTagsCollection, componentId, tags) {
        var intialTags = $filter('tagFilter')(tags);
        $scope.tags = new JSTagsCollection(intialTags);
        // Export jsTags options, inlcuding our own tags object
        $scope.jsTagOptions = {
            'tags': $scope.tags,
            'texts': {
                'inputPlaceHolder': 'Tag'
            }
        };



        // Build suggestions array
        var suggestions = ['gold', 'silver', 'golden'];
        suggestions = suggestions.map(function (item) {
            return {
                "suggestion": item
            }
        });

        // Instantiate the bloodhound suggestion engine
        var suggestions = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.suggestion);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: suggestions
        });


        // Initialize the bloodhound suggestion engine
        suggestions.initialize();

        // Single dataset example
        $scope.exampleData = {
            displayKey: 'suggestion',
            source: suggestions.ttAdapter()
        };

        // Typeahead options object
        $scope.exampleOptions = {
            hint: false,
            highlight: true
        };

        tagPredictionService.getTag('').then(function(result){
            var tags = ($filter('tagFilter')(result.data));
            tags = tags.map(function (item) {
                return {
                    "suggestion": item
                }
            });
    
            suggestions.add(tags);
        });

        $scope.confirm = function () {
         
            var difference = arrayDiff(intialTags, $scope.extractTags());
            if (difference[0].length > 0) {
                tagPredictionService.addTags(componentId, difference[0]);
            }

             if (difference[1].length > 0) {
                const deletePromises = difference[1].map(tagPredictionService.deleteTag, { componentId: componentId });
                Promise.all(deletePromises);
            } 
            $mdDialog.cancel($scope.extractTags());
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        }

        $scope.extractTags = function () {
            var query = [];
            Object.keys($scope.tags.tags).forEach(function (key, index) {
                var value = $scope.tags.tags[key].value;
                query.push(value.replace(/\s/g, ''));
            });
            return query;
        }

        function arrayDiff(oldAr, newAr) {
            var removed = [];
            var added = [];

            var pointer = 0;

            for (var i = 0, n = newAr.length; i < n; i++) {

                var found = false;

                for (var o = pointer, m = oldAr.length; o < m; o++) {
                    if (newAr[i] === oldAr[o]) {
                        swap(oldAr, pointer, o);
                        pointer++;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    added.push(newAr[i]);
                }
            }

            removed = oldAr.slice(pointer);
            return [added, removed];
        }

        function swap(array, indexA, indexB) {
            var temp = array[indexA];
            array[indexA] = indexB;
            array[indexB] = temp;
        }

        function extractTagObjects(tagObjectArray) {
            var tagArray = [];

            for (var i = 0, n = tagObjectArray.length; i < n; i++) {
                tagArray.push(tagObjectArray[i].tag);
            }
            return tagArray;
        }




    }


}])