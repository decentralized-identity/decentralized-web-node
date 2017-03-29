// henrytsai: export a function called "initialize" which takes a router object as an input argument.
module.exports.initialize = function (router) {

    router.route('/.well-known/identity/:id/collections/:context')
        .get(function (request, response) {
            // henrytsai: TODO.
            let jsonResponse = {
                id: request.params.id,
                context: request.params.context,
                description: "TODO: collection controller"
            };

            response.json(jsonResponse);
        });
};