app.service('tagEditPanelService', ['$log', '$mdDialog', function ($log, $mdDialog) {

    var self = this;

    self.showTagEditPanel = function (ev, tags) {
        $mdDialog.show({
            templateUrl: 'app/components/columnTabPanel/tagEditPanel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
                tags: tags
            },
            controller: tagEditPanelController
        }).catch(function(result){
            if(result != undefined){
                
            }
        })
    }

    function tagEditPanelController($scope, $mdDialog, JSTagsCollection, tags) {
        $scope.tags = new JSTagsCollection(tags);
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

        $scope.confirm = function(){
            $mdDialog.cancel($scope.extractTags());
        }

        $scope.cancel = function(){
            $mdDialog.cancel();
        }

        $scope.extractTags = function () {
            var query = [];
            console.log($scope.tags);
            Object.keys($scope.tags.tags).forEach(function (key, index) {
                query.push($scope.tags.tags[key].value);
            });
            return query;
        }

   


    }


}])