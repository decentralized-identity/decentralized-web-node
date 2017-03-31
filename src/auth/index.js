// Export a function called "authenticate", this acts as the Express middleware for authentication.
// This function passes the request to the next handler if the requester's token passes authentication verification.
module.exports.authenticate = function (req, res, next) {

    let encodedToken = req.headers['authentication'];

    // Return 401 if token for authentication not given.
    if (!encodedToken) {
        console.log("Expected token header not given.");
        writeUnauthenticatedResponse(res);
        return;
    }

    let jwtLib = require('jsonwebtoken');
    let unverifiedToken = jwtLib.decode(encodedToken);

    // Return 401 if token is malformed.
    if (!unverifiedToken) {
        console.log("Unable to decode token.");
        writeUnauthenticatedResponse(res);
        return;
    }

    let requesterId = unverifiedToken.sub;

    GetPublicKeyAsync(requesterId)
        .then(function (publicKey){
            return VerifyTokenSignatureAsync(encodedToken, publicKey);
        },
        // Failure handler
        function () {
            console.log(`Failed fetching public key of requester '${requesterId}'`);
            writeUnauthenticatedResponse(res);
            return;
        })
        .then(function () {
            // TODO: remainder of validations

            req.requester = { did: requesterId };
            next();
        },
        // Failure handler
        function () {
            console.log(`Failed token signature validation for requester '${requesterId}'`);
            writeUnauthenticatedResponse(res);
            return;
        });
}

// Export a function called "authenticate", this acts as the Express middleware for authorization.
// This function passes the request to the next handler if the requester is authorized to make the request.
module.exports.authorize = function (req, res, next) {

    // If there is no user object in the request, it means user is not authenticated.
    if (!req.requester) {
        console.log("Unable to find requester object in request.");
        writeUnauthenticatedResponse(res);
        return;
    }

    // TODO: do real authorization.

    next();
};

function writeUnauthenticatedResponse(response) {
    response.status(401).send("Requester not authenticated.");
}

function VerifyTokenSignatureAsync(encodedToken, publicKey) {
    let promise = new Promise(function (resolve, reject) {

        let jwtLib = require('jsonwebtoken');

        jwtLib.verify(encodedToken, publicKey, function (err, decoded) {
            if (!err) {
                resolve();
            }
            else {
                reject();
            }
        });
    });

    return promise;
}

function GetPublicKeyAsync(id) {
    let promise = new Promise(function (resolve, reject) {

        // TODO: get the public key from the correct identity provider based on the id.
        // NOTE: you can get the dummy signed token that will work the public key below from jwt.io.
        let publicKey =
            "-----BEGIN PUBLIC KEY-----" + "\n" +
            "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQAB" + "\n" +
            "-----END PUBLIC KEY-----  ";

        resolve(publicKey);
    });

    return promise;
}