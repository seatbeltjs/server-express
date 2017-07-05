import * as express from 'express';
import { ServerPlugin } from '@seatbelt/core/plugins';
export interface IServerConfig {
    port?: number;
}
export declare class ExpressServer implements ServerPlugin.BaseInterface {
    server: express.Express;
    port: number;
    private log;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: ServerPlugin.Config;
    init: ServerPlugin.Init;
}
