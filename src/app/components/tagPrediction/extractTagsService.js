angular.module('app').service('extractTagService', extractTagService);

extractTagService.$inject = [

];



function extractTagService() {
    var self = this;

    self.formatTagsFromRun = formatTagsFromRun;

    // extract tags from each run
    function formatTagsFromRun(runs) {
        var tagsCollection = {};

        runs.forEach(run => {
            tagsCollection[run.id] = extractTags(run.tags)
        });

        return tagsCollection
    }

    // converts a tagObject to a tag array
    function extractTags(tagObject) {
        var tags = [];

        var tagIds = Object.keys(tagObject);

        tagIds.forEach(tagId => {
            tags.push({
                id: tagId,
                tag: tagObject[tagId]
            })
        });

        return tags
    }
}