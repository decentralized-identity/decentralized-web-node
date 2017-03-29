let express = require('express');
let collectionController = require("./collectionController");
let profileController = require("./profileController");

let router = express.Router();

// henrytsai: Passing in the root router object for individual controller to configure its own routes.
collectionController.initialize(router);
profileController.initialize(router);

module.exports = router;
