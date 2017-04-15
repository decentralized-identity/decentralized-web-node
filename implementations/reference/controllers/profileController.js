let dataService = require('../data');
let profileService = dataService.profileService;

// Exporting a function called "initialize" which takes a router object as an input argument.
module.exports.initialize = function (router) {

    router.route('/.well-known/identity/:id/profile')
        .get(function (req, res) {

            let jsonResponse = profileService.fetchProfileAsync(req.params.id)
                .then(function (profile) {
                    res.json(profile);
                }, function () {
                    res.status(404).send("Profile not found.");
                    return;
                });
        });
};
