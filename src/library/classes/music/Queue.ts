import { Message, MessageEmbed } from "discord.js";
import { AkairoClient } from "discord-akairo";
import { decode } from "@lavalink/encoding";
import { EventEmitter } from "events";
import { Player } from "lavaclient";

interface QueueObject {
  track: string;
  requester: string;
}

interface RepeatObject {
  song: boolean;
  queue: boolean;
}

export class Queue extends EventEmitter {
  public next: QueueObject[] = [];
  public previous: QueueObject[] = [];
  public current: QueueObject;
  public repeat: RepeatObject = { song: false, queue: false };

  private message: Message;

  public constructor(public player: Player) {
    super();

    player
      .on("end", async (evt) => {
        if (evt && ["REPLACED", "STOPPED"].includes(evt.reason)) return;

        if (this.repeat.song) this.next.unshift(this.current);
        else if (this.repeat.queue) this.previous.push(this.current);

        if (this.message.guild.me.voice.channel.members.size === 1)
          return this.emit("finished", "alone");

        this._next();

        if (!this.current) return this.emit("finished", "empty");
        await player.play(this.current.track);
      })
      .on("start", (evt) => {
        if (!evt) return;

        const { title, identifier, uri, author } = decode(evt.track);

        this.message.channel.send(
          new MessageEmbed()
            .setColor("#7289DA")
            .setThumbnail(`https://i.ytimg.com/vi/${identifier}/hqdefault.jpg`)
            .setDescription(
              this.message.translate("bot.queue.nowplaying", {
                title,
                uri,
                author,
              })
            )
        );
      })
      .on("stuck", () => {
        this.message.channel.send(
          new MessageEmbed()
            .setColor("#f55e53")
            .setDescription(this.message.translate("bot.queue.stuck"))
        );
      })
      .on("error", (error) => {
        this.message.channel.send(
          new MessageEmbed().setColor("#f55e53").setDescription(
            this.message.translate("bot.queue.error", {
              invite: config.get("bot.links.discord"),
              error,
            })
          )
        );
      });

    this.on("finished", async (reason: string) => {
      if (this.repeat.queue) {
        this.next.push(...this.previous);
        this.previous = [];
        return await this.start(this.message);
      }

      switch (reason) {
        case "empty":
        default:
          this.message.channel.send(
            new MessageEmbed()
              .setColor("#7289DA")
              .setDescription(
                this.message.translate("bot.queue.finished.empty")
              )
          );

          return await this.clear();

        case "alone":
          this.message.channel.send(
            new MessageEmbed()
              .setColor("#7289DA")
              .setDescription(
                this.message.translate("bot.queue.finished.alone")
              )
          );

          return await this.clear();

        case "disconnected":
          this.message.channel.send(
            new MessageEmbed()
              .setColor("#7289DA")
              .setDescription(
                this.message.translate("bot.queue.finished.disconnected")
              )
          );

          return await this.clear();
      }
    });
  }

  public shuffle() {
    for (let i = 0; i < this.next.length - 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.next[i], this.next[j]] = [this.next[j], this.next[i]];
    }
    return this.next;
  }

  public loop(type: "queue" | "song") {
    this.repeat[type] = !this.repeat[type];
    this.repeat[type === "queue" ? "song" : "queue"] = false;

    if (Object.values(this.repeat).some((val) => !val))
      this.player.repeating = "nothing";
    else this.player.repeating = type;

    return this.repeat;
  }

  public _next() {
    return (this.current = this.next.shift());
  }

  public add(track: string, requester: string) {
    return this.next.push({ track, requester });
  }

  public async clear() {
    this.next = [];
    this.previous = [];
    this.repeat = { song: false, queue: false };

    return await this.player.manager.destroy(
      this.message.guild.id ?? this.player.guild
    );
  }

  public async start(message: Message) {
    this.message = message;
    if (!this.current) this._next();
    await this.player.play(this.current.track);
  }
}
