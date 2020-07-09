import { Listener } from "discord-akairo";
import { VoiceServer } from "lavaclient";

export default class VoiceStateUpdateEvent extends Listener {
  public constructor() {
    super("VOICE_SERVER_UPDATE", {
      emitter: "websocket",
      event: "VOICE_SERVER_UPDATE",
    });
  }

  exec(payload: VoiceServer) {
    this.client.music.serverUpdate(payload);
  }
}
