var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const core_1 = require("@seatbelt/core");
function DExpress() {
    return function (originalClassConstructor) {
        let ExpressServer = class ExpressServer extends originalClassConstructor {
            constructor() {
                super();
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
        ExpressServer = __decorate([
            core_1.DRegisterServer()
        ], ExpressServer);
        ;
        return ExpressServer;
    };
}
exports.DExpress = DExpress;
