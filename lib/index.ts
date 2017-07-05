import * as bodyParser from 'body-parser';
import * as express from 'express';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Log, Route } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@ServerPlugin.Register({
  name: 'ExpressServer'
})
export class ExpressServer implements ServerPlugin.BaseInterface {
  public server: express.Express = express();
  public port: number = process.env.port || 3000;
  private log: Log = new Log('ExpressServer');

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: ServerPlugin.RouteInterface, req: express.Request, res: express.Response) {

    const send = (status: number, body: Object) => res.status(status).send(body);

    const seatbeltResponse: Route.Response.BaseInterface = {
      send,
      ok: (body: Object) => send(200, body),
      created: (body: Object) => send(201, body),
      badRequest: (body: Object) => send(400, body),
      unauthorized: (body: Object) => send(401, body),
      forbidden: (body: Object) => send(403, body),
      notFound: (body: Object) => send(404, body),
      serverError: (body: Object) => send(500, body)
    };

    const seatbeltRequest: Route.Request.BaseInterface = {
      allParams: Object.assign(
        {},
        typeof req.query === 'object' ? req.query : {},
        typeof req.params === 'object' ? req.params : {},
        typeof req.body === 'object' ? req.body : {}
      )
    };

    return route.controller(
      seatbeltRequest,
      seatbeltResponse,
      {
        req,
        res
      }
    );
  };

  public config: ServerPlugin.Config = function(seatbelt: any, cb: Function) {
    const routes: ServerPlugin.RouteInterface[] = seatbelt.plugins.route;

    this.server.use(bodyParser.json());
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: ServerPlugin.RouteInterface) => {
        route['__routeConfig'].type.forEach((eachType: string) => {
          route['__routeConfig'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: express.Request, res: express.Response) => this.conformServerControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
    cb();
  };

  public init: ServerPlugin.Init = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port, () => {
      this.log.system(`server listening on port ${this.port}!`);
    });
  };
}
