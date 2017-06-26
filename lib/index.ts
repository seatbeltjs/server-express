import * as bodyParser from 'body-parser';
import * as express from 'express';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@ServerPlugin.Register({
  name: 'ExpressServer'
})
export class ExpressServer implements ServerPlugin.BaseServer {
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

  public conformServerControllerToSeatbeltController: Function = function (route: ServerPlugin.Route, req: express.Request, res: express.Response) {

    const seatbeltResponse: ServerPlugin.Response = {
      send: (status: number, body: Object) => {
        res.status(status);
        return res.send(body);
      }
    };

    const seatbeltRequest: ServerPlugin.Request = {
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

  public config: ServerPlugin.Config = function(seatbelt: any) {
    const routes: ServerPlugin.Route[] = seatbelt.plugins.route;

    this.server.use(bodyParser.json());
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: ServerPlugin.Route) => {
        route['__routeConfig'].type.forEach((eachType: string) => {
          route['__routeConfig'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: express.Request, res: express.Response) => this.conformExpressControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
  };

  public init: ServerPlugin.Init = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port, () => {
      this.log.system(`server listening on port ${this.port}!`);
    });
  };
}
