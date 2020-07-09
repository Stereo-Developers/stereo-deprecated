import { Structures } from "lavaclient";
import { Queue } from "../classes";

type Levels = "hard" | "medium" | "low" | "none";
type Repeats = "song" | "queue" | "nothing";
type Filters = "nightcore" | "slowed" | "default";

export default Structures.extend(
  "player",
  (Player) =>
    class StereoPlayer extends Player {
      public bass: Levels = "none";
      public repeating: Repeats = "nothing";
      public filter: Filters = "default";

      public queue: Queue = new Queue(this);

      public send(op: string, body = {}) {
        const guildId = this.guild;
        return this.socket.send({ op, ...body, guildId });
      }
    }
);
