"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const resolver_1 = require("../../resolver");
const app_1 = require("../../config/app");
// THIS NEEDS TO BE A SEPARATE NPM MODULE
const did_auth_1 = require("../../lib/did-auth");
const URL = require('url');
const indexRouter = new Router();
exports.indexRouter = indexRouter;
const nano = require('nano')(app_1.default.dbURL);
// consider a default ID token that directs to a designated identity's Hub data
function parseAuthHeader(header) {
    if (header) {
        // header.split()
    }
    else
        return false;
}
indexRouter.use('*', (ctx) => __awaiter(this, void 0, void 0, function* () {
    yield new Promise(function (resolve, reject) {
        resolver_1.default
            .lookup('bob.id')
            .then(response => {
            // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
            var pubkey;
            var ddo = response.ddo;
            var did = ddo.id;
            ddo.owner.some(item => {
                // Which key pair do we challenge with? Can the DDO flag it?
                if (item.type[1] == 'secp256k1PublicKey') {
                    pubkey = item.publicKeyHex;
                    return true;
                }
                return false;
            });
            console.log(ddo);
            // var verifier = crypto.createVerify("RSA-SHA256");
            // verifier.update(nonceString);
            // var publicKeyBuf = new Buffer(pubkey, 'base64');
            //var result = null //verifier.verify(publicKeyBuf, signature, "base64");
            var result = true;
            if (result) {
                ctx.body = ddo;
                resolve();
            }
            else
                reject();
        });
    });
}));
indexRouter.post('/.identity/:id', function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // DID or dan.id
        // Prove You Own It call. Where?
        yield resolver_1.default
            .lookup(ctx.params.id)
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
            var pubkey;
            var ddo = response.ddo;
            var did = ddo.id;
            ddo.owner.some(item => {
                // Which key pair do we challenge with? Can the DDO flag it?
                if (item.type[1] == 'secp256k1PublicKey') {
                    pubkey = item.publicKeyHex;
                    return true;
                }
                return false;
            });
            // Validate it with a lib we use or create;
            yield did_auth_1.default
                .validate(pubkey, ctx.params.sig)
                .then(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // Check to see if the user already has a DB in Couch - if so exit, if not, sync existing remote or create one
                    if (!nano.use(did)) {
                        var hubs = ddo.service && ddo.service.hubs;
                        if (hubs) {
                            for (let hub of hubs) {
                                if (new URL(hub).hostname != app_1.default.hostname) {
                                    yield new Promise(function (resolve, reject) {
                                        nano.db.replicate(hubs[hub], did, { create_target: true }, function (error, body) {
                                            if (error)
                                                reject(error);
                                            else
                                                resolve(body);
                                        });
                                    });
                                }
                            }
                        }
                        else {
                            nano.db.create(did, (error) => {
                                if (!error) {
                                    ctx.body = 'DB created for user';
                                }
                            });
                        }
                    }
                    else {
                        ctx.body = 'User already exists';
                    }
                });
            })
                .catch(function () {
                ctx.body = 'Request could not be validated';
            });
        }))
            .catch(() => {
            ctx.body = 'Could not resolve';
        });
    });
});
indexRouter.get('/.identity/:id', function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure that there is an ID passed to the Hub
        console.log(ctx.params.id);
        if (!ctx.params.id)
            ctx.body = 'You must include a DID or TLN ID';
        else
            yield resolver_1.default.resolve(ctx.params.id).then(response => {
                ctx.body = "Success";
            });
    });
});
const extensions_1 = require("./extensions");
exports.extensionsRouter = extensions_1.default;
//# sourceMappingURL=index.js.map