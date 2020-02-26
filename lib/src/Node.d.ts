/// <reference types="node" />
import net from 'net';
import { EventEmitter } from 'events';
import { Peer } from './Peer';
export interface NodeOptions {
    port: number;
    seedHosts: string[];
    minPeers: number;
    maxPeers: number;
    debug: (...args: any[]) => void;
}
export interface Message {
    hops?: number;
    command: string;
    broadcast: boolean;
}
export declare class Node extends EventEmitter {
    /**
     * Creates a new network Node
     * @param port {Number}
     * @param seedHosts {String[]}
     * @param minPeers {Number}
     * @param maxPeers {Number}
     */
    id: string;
    hostname: string;
    port: number | string;
    host: string;
    minPeers: number;
    maxPeers: number;
    peers: Peer[];
    receivedMessages: Record<string, boolean>;
    seedHosts: string[];
    server: net.Server;
    debug: (...args: any[]) => void;
    constructor({ port, seedHosts, minPeers, maxPeers, debug }: NodeOptions);
    createMessage({ command, payload, broadcast, }: {
        command: string;
        payload: object;
        broadcast: boolean;
    }): {
        id: string;
        sender: string;
        command: string;
        payload: object;
        broadcast: boolean;
    };
    broadcast(command: string, payload?: {}): void;
    broadcastMessage(message: Message): void;
    /**
     * Create an outgoing connection to a server peer
     * @param hostname {String}
     * @param port {Number}
     */
    connect({ hostname, port }: {
        hostname: string;
        port: number;
    }): void;
    removePeer(peer: Peer): void;
    /**
     * Listen for incoming connections from client peers
     */
    startServer(): void;
    addSeedHosts(hosts: string[]): void;
    removeSeedHost(host: string): void;
    joinNetwork(): void;
}
