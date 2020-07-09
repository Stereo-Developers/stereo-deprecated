import { Listener } from "discord-akairo";
import { VoiceState } from "lavaclient";

export default class VoiceStateUpdateEvent extends Listener {
  public constructor() {
    super("VOICE_STATE_UPDATE", {
      emitter: "websocket",
      event: "VOICE_STATE_UPDATE",
    });
  }

  exec(payload: VoiceState) {
    this.client.music.stateUpdate(payload);
  }
}
