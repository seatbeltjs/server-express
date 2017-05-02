"use strict";
exports.__esModule = true;
var log_1 = require("../core/src/log");
var bodyParser = require('body-parser');
function DExpress() {
    return function (OriginalClassConstructor) {
        return function () {
            var origin = new OriginalClassConstructor();
            origin.__seatbelt__ = 'server';
            origin.__seatbelt_strap__ = function (classesByType) {
                origin.express = require('express');
                origin.app = origin.express();
                origin.port = process.env.port || 3000;
                origin.log = new log_1.Log('Express');
                origin.app.use(bodyParser.json());
                origin.__controller_wrapper__ = function (controllerFunction, req, res, next) {
                    controllerFunction({
                        req: req,
                        res: res,
                        next: next,
                        reply: function () {
                            var params = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                params[_i] = arguments[_i];
                            }
                            return res.send.apply(res, params);
                        },
                        params: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {}, typeof req.query === 'object' ? req.query : {})
                    });
                };
                if (classesByType['route']) {
                    classesByType['route'].forEach(function (route) {
                        var policies = [];
                        route.__seatbelt_config__.policies.forEach(function (routePolicyName) {
                            classesByType['policy'].forEach(function (policy) {
                                if (routePolicyName === policy.__name__) {
                                    policies.push(function (req, res, next) { return origin.__controller_wrapper__(policy.controller, req, res, next); });
                                }
                            });
                        });
                        var policiesPlusController = policies.concat([
                            function (req, res, next) { return origin.__controller_wrapper__(route.controller, req, res, next); }
                        ]);
                        route['__seatbelt_config__'].type.forEach(function (eachType) {
                            route['__seatbelt_config__'].path.forEach(function (eachPath) {
                                (_a = origin.app)[eachType.toLowerCase()].apply(_a, [eachPath].concat(policiesPlusController));
                                var _a;
                            });
                        });
                    });
                }
                origin.app.listen(origin.port, function () {
                    origin.log.system("Example app listening on port " + origin.port + "!");
                });
            };
            return origin;
        };
    };
}
exports.DExpress = DExpress;
