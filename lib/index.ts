import * as bodyParser from 'body-parser';
import * as express from 'express';
import { DRegisterServer, Log } from '@seatbelt/core';

export function DExpress(): any {
  return function(originalClassConstructor: new () => {}) {
    @DRegisterServer()
    class ExpressServer extends originalClassConstructor {
      constructor() {
        super();
      }
      public server = express();
      public port = process.env.port || 3000;
      public log = new Log('ExpressServer');
      public __controller_wrapper__ = function (route: any, req: any, res: any, next: Function) {
        route.controller({
          next,
          send: (...params: any[]) => res.send(...params),
          params: Object.assign(
            {},
            typeof req.params === 'object' ? req.params : {},
            typeof req.body === 'object' ? req.body : {}
            ,
            typeof req.query === 'object' ? req.query : {}
          )
        }, {
          req,
          res,
          next
        });
      };
      public __seatbelt_server_config__ = function(routes: any[]) {
        this.server.use(bodyParser.json());
        if (routes && Array.isArray(routes)) {
          routes.forEach((route: any) => {
            route['__seatbelt_config__'].type.forEach((eachType: string) => {
              route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                this.server[eachType.toLowerCase()](eachPath, (req: any, res: any, next: Function) => this.__controller_wrapper__(route, req, res, next));
              });
            });
          });
        }
      };
      public __seatbelt_server_init__: Function = function () {
        this.log.system(`starting server on ${this.port}`);
        this.server.listen(this.port, () => {
          this.log.system(`server listening on port ${this.port}!`);
        });
      };
    }
    return ExpressServer;
  };
}
