"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolver = {
    resolve: function (id) {
        return new Promise(function (resolve, reject) {
            resolve({
                did: 'did:btcr:123',
                ddo: {}
            });
        });
    },
    auth: function (did, request) {
        return true;
    }
};
exports.default = resolver;
//# sourceMappingURL=index.js.map