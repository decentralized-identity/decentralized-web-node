class ProfileService {
    fetchProfileAsync(id) {

        let promise = new Promise(function (resolve, reject) {
            // TODO - provide real implemenation.
            let jsonResponse = {
                id: id,
                description: "TODO: ProfileService"
            };

            resolve(jsonResponse);
        });

        return promise;
    }
};

module.exports = ProfileService;
