import * as bodyParser from 'body-parser';
import * as express from 'express';

export function DExpress(): any {
  return function(originalClassConstructor: new () => {}) {
    return class extends originalClassConstructor {
      public __seatbelt__: string;
      public __seatbelt_strap__: Function;
      constructor() {
        super();
        this.__seatbelt__ = 'server';
        this.__seatbelt_strap__ = function(routes: any[]) {
          this.server = express();
          this.port = process.env.port || 3000;
          this.server.use(bodyParser.json());
          this.__controller_wrapper__ = function (route: any, req: any, res: any, next: Function) {
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

          if (routes && Array.isArray(routes)) {
            routes.forEach((route: any) => {
              route['__seatbelt_config__'].type.forEach((eachType: string) => {
                route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                  this.server[eachType.toLowerCase()](eachPath, (req: any, res: any, next: Function) => this.__controller_wrapper__(route, req, res, next));
                });
              });
            });
          }

          this.server.listen(this.port, () => {
            console.log(`Example app listening on port ${this.port}!`);
          });

        };
      };
    };
  };
}
