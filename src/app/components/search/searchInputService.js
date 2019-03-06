app.service('searchInputService', ['$log', '$filter', 'JSTagsCollection', 'tagPredictionService', function ($log, $filter, JSTagsCollection, tagPredictionService) {

    var self = this;

    var inputQueries = null;


    self.getQuery = getQuery;
    self.populateInput = populateInput;
    self.suggestions = suggestions;


    self.jsTagOptions;
    self.exampleData;



    function getQuery() {
        if (inputQueries) {
            return extractQueries(inputQueries).join(" ");
        }
    }


    function extractQueries(tags) {
        var tagsArray = [];
        Object.keys(tags.tags).forEach(function (key, index) {
            tagsArray.push(tags.tags[key].value);
        });
        return tagsArray;
    }

    function populateInput(query) {
        if (query) {
            inputQueries = new JSTagsCollection(query.split("%20"));
        } else {
            inputQueries = new JSTagsCollection();
        }


        return {
            "tags": inputQueries,
            "texts": {
                "inputPlaceHolder": ""
            }
        };

    }

    function suggestions() {
        // Instantiate the bloodhound suggestion engine
        var suggestions = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.suggestion);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: []
        });


        self.exampleData = {
            displayKey: 'suggestion',
            source: suggestions.ttAdapter()
        };

        suggestions.initialize();
        populateSuggestions(suggestions);

    }

    function populateSuggestions(bloodhound) {

        //sending no param to getTags retrieves all tags
        tagPredictionService.getTag().then(function (result) {
            tags = ($filter('tagFilter')(result.data));
            tags = tags.map(function (item) {
                return {
                    "suggestion": item
                }
            });

            bloodhound.add(tags);
        })
    }




}])