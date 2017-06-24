import * as express from 'express';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';
export interface IServerConfig {
    port?: number;
}
export declare class ExpressServer implements Server.BaseServer {
    server: express.Express;
    port: number;
    log: Log;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: Server.Config;
    init: Server.Init;
}
