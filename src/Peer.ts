import net from 'net';
import split from 'split';
import { Message, Node } from './Node';
import { ThroughStream } from 'through';
import { v4 as uuid } from 'uuid';

export interface Socket extends net.Socket {
  ending: boolean;
}

export class Peer {
  id: string;
  splitter: ThroughStream;
  socket: Socket;
  node: Node;
  port: number;
  receivedMessages: Record<string, boolean>;
  host: string;
  isOutgoingConnection: boolean;
  isIncomingConnection: boolean;

  constructor({ socket, node }: { node: Node; socket: Socket }) {
    this.id = uuid();
    const splitter = split(JSON.parse, null, { trailing: false } as any);
    socket.pipe(splitter).on('data', data => this.receive(data));
    this.socket = socket;
    this.node = node;
    this.receivedMessages = {};
  }

  receive(message: any) {
    if (!message || !message.command) {
      throw new Error('Message missing command.');
    }
    const isOriginalSender = message.sender === this.node.id;
    const alreadyReceived = this.node.receivedMessages[message.id];
    if (alreadyReceived || isOriginalSender) return;
    this.node.receivedMessages[message.id] = true;
    const hostname = this.getHostname();
    if (message.broadcast) {
      this.node.broadcastMessage(message);
    }
    switch (message.command) {
      case 'port?':
        return this.send('port!', this.node.port);
      case 'port!': {
        const port = Number(message.payload);
        this.port = port;
        return this.node.addSeedHosts([`${hostname}:${port}`]);
      }
      case 'hosts?': {
        if (!this.node.seedHosts.length) return;
        return this.send('hosts!', this.node.seedHosts);
      }
      case 'hosts!': {
        // this.seedHosts = message.payload
        return this.node.addSeedHosts(message.payload);
      }
      default:
        this.node.debug('[p2p] receive:', message.command, message.payload);
        return this.node.emit(message.command, {
          id: message.id,
          name: message.command,
          data: message.payload,
          peer: this,
          hops: message.hops,
          sender: message.sender,
        });
    }
  }

  send(command: string, payload = {}, broadcast = false) {
    if (this.socket.ending) return;
    const message = this.node.createMessage({ command, payload, broadcast });
    this.write(message);
  }

  write(message: Message) {
    try {
      this.socket.write(`${JSON.stringify(message)}\n`);
    } catch (err) {
      this.node.removePeer(this);
    }
  }

  getHostname() {
    const hostname = this.socket.remoteAddress;
    switch (hostname) {
      case '127.0.0.1':
      case '::ffff:127.0.0.1':
        return 'localhost';
      default:
        return hostname;
    }
  }
}
