import * as bodyParser from 'body-parser';
import * as express from 'express';
import { DServerRegister, IServerRequest, IServerResponse, IServerRoute, Log } from '@seatbelt/core';

@DRegisterServer()
export class ExpressServer {
  public server: express.Express = express();
  public port: number = process.env.port || 3000;
  public log: Log = new Log('ExpressServer');
  public conformExpressControllerToSeatbeltController: Function = function (route: any, req: any, res: any, next: Function) {
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
  public config: Function = function(routes: any[]) {
    this.server.use(bodyParser.json());
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: any) => {
        route['__seatbelt_config__'].type.forEach((eachType: string) => {
          route['__seatbelt_config__'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: any, res: any, next: Function) => this.conformExpressControllerToSeatbeltController(route, req, res, next));
          });
        });
      });
    }
  };
  public init: Function = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port, () => {
      this.log.system(`server listening on port ${this.port}!`);
    });
  };
}

export const server: ExpressServer = new ExpressServer();
