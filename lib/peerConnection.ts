import SimplePeer from "simple-peer";

type PeerConfig = {
  initiator: boolean;
  signalingServerUrl: string;
  onData?: (data: string) => void;
  onConnect?: () => void;
};

export class PeerConnection {
  private peer: SimplePeer.Instance;
  private signaling: WebSocket;

  constructor({ initiator, signalingServerUrl, onData, onConnect }: PeerConfig) {
    // connect signaling server
    this.signaling = new WebSocket(signalingServerUrl);

    this.signaling.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.signal) {
        this.peer.signal(data.signal);
      }
    };

    // create peer
    this.peer = new SimplePeer({ initiator, trickle: true });

    this.peer.on("signal", (signal) => {
      this.signaling.send(JSON.stringify({ signal }));
    });

    this.peer.on("connect", () => {
      console.log("Peer connected!");
      onConnect?.();
    });

    this.peer.on("data", (data) => {
      onData?.(data.toString());
    });
  }

  send(message: string) {
    if (this.peer.connected) {
      this.peer.send(message);
    }
  }

  destroy() {
    this.peer.destroy();
    this.signaling.close();
  }
}
