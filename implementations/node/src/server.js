"use strict";
exports.__esModule = true;
var api_1 = require("./api");
var app_1 = require("./config/app");
api_1["default"].listen(app_1["default"].port, function () {
    console.log("Your app is running at " + app_1["default"].baseURL);
});
