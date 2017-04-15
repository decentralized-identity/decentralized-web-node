let express = require('express');
let auth = require("../auth");
let collectionController = require("./collectionController");
let profileController = require("./profileController");

let router = express.Router();

// Requests must pass authentication and authorization middleware before routed onto controllers.
router.use(auth.authenticate);
router.use(auth.authorize);

// Passing in the root router object for individual controller to configure its own routes.
collectionController.initialize(router);
profileController.initialize(router);

module.exports = router;
