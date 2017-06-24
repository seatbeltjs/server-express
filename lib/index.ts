import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@Server.Register()
export class ExpressServer implements Server.BaseServer {
  public server: express.Express = express();
  public port: number = process.env.port || 3000;
  public log: Log = new Log('ExpressServer');

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: Server.Route, req: express.Request, res: express.Response) {

    const seatbeltResponse: Server.Response = {
      send: (status: number, body: Object) => {
        res.status(status);
        return res.send(body);
      }
    };

    const seatbeltRequest: Server.Request = {
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

  public config: Server.Config = function(routes: Server.Route[]) {
    this.server.use(bodyParser.json());
    if (routes && Array.isArray(routes)) {
      routes.forEach((route: Server.Route) => {
        route['__seatbeltConfig'].type.forEach((eachType: string) => {
          route['__seatbeltConfig'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: express.Request, res: express.Response) => this.conformExpressControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
  };

  public init: Server.Init = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port, () => {
      this.log.system(`server listening on port ${this.port}!`);
    });
  };
}
