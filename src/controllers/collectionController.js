// Exporting a function called "initialize" which takes a router object as an input argument.
module.exports.initialize = function (router) {

    router.route('/.well-known/identity/:id/collections/:context')
        .get(function (req, res) {
            // TODO.
            let jsonResponse = {
                id: req.params.id,
                context: req.params.context,
                description: "TODO: collection controller"
            };

            res.json(jsonResponse);
        });
};