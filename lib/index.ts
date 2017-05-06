const bodyParser = require('body-parser');

export function DExpress(): any {
  return function(OriginalClassConstructor: any) {

    return function () {
      const origin = new OriginalClassConstructor();
      origin.__seatbelt__ = 'server';
      origin.__seatbelt_strap__ = function(classesByType: any) {
        origin.express = require('express');
        origin.app = origin.express();
        origin.port = process.env.port || 3000;
        origin.app.use(bodyParser.json());
        origin.__controller_wrapper__ = function (controllerFunction: Function, req: any, res: any, next: Function) {
          controllerFunction({
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

        if (classesByType['route']) {
          classesByType['route'].forEach((route: any) => {
            const policies: any[] = [];
            route.__seatbelt_config__.policies.forEach((routePolicyName: string) => {
              classesByType['policy'].forEach((policy: any) => {
                if (routePolicyName === policy.__name__) {
                  policies.push((req: any, res: any, next: Function) => origin.__controller_wrapper__(policy.controller, req, res, next));
                }
              });
            });

            const policiesPlusController = [
              ...policies,
              (req: any, res: any, next: Function) => origin.__controller_wrapper__(route.controller, req, res, next)
            ];
            route['__seatbelt_config__'].type.forEach((eachType: string) => {
              route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                origin.app[eachType.toLowerCase()](eachPath, ...policiesPlusController);
              });
            });
          });
        }

        origin.app.listen(origin.port, () => {
          console.log(`Example app listening on port ${origin.port}!`);
        });

      };
      return origin;
    };
  };
}
