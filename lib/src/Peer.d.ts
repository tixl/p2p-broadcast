/// <reference types="node" />
import net from 'net';
import { Message, Node } from './Node';
import { ThroughStream } from 'through';
export interface Socket extends net.Socket {
    ending: boolean;
}
export declare class Peer {
    id: string;
    splitter: ThroughStream;
    socket: Socket;
    node: Node;
    port: number;
    receivedMessages: Record<string, boolean>;
    host: string;
    isOutgoingConnection: boolean;
    isIncomingConnection: boolean;
    constructor({ socket, node }: {
        node: Node;
        socket: Socket;
    });
    receive(message: any): boolean | void;
    send(command: string, payload?: {}, broadcast?: boolean): void;
    write(message: Message): void;
    getHostname(): string | undefined;
}
