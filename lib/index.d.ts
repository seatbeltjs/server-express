import * as express from 'express';
import { Log } from '@seatbelt/core';
export declare class ExpressServer {
    server: express.Express;
    port: number;
    log: Log;
    conformExpressControllerToSeatbeltController: Function;
    config: Function;
    init: Function;
}
export declare const server: ExpressServer;
