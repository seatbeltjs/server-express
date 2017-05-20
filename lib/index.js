Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
function DExpress() {
    return function (originalClassConstructor) {
        return class extends originalClassConstructor {
            constructor() {
                super();
                this.__seatbelt__ = 'server';
                this.__seatbelt_strap__ = function (routes) {
                    this.server = express();
                    this.port = process.env.port || 3000;
                    this.server.use(bodyParser.json());
                    this.__controller_wrapper__ = function (route, req, res, next) {
                        route.controller({
                            next,
                            send: (...params) => res.send(...params),
                            params: Object.assign({}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {}, typeof req.query === 'object' ? req.query : {})
                        }, {
                            req,
                            res,
                            next
                        });
                    };
                    if (routes && Array.isArray(routes)) {
                        routes.forEach((route) => {
                            route['__seatbelt_config__'].type.forEach((eachType) => {
                                route['__seatbelt_config__'].path.forEach((eachPath) => {
                                    this.server[eachType.toLowerCase()](eachPath, (req, res, next) => this.__controller_wrapper__(route, req, res, next));
                                });
                            });
                        });
                    }
                    this.server.listen(this.port, () => {
                        console.log(`Example app listening on port ${this.port}!`);
                    });
                };
            }
            ;
        };
    };
}
exports.DExpress = DExpress;
