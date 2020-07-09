import Logger from "@ayanaware/logger";
import { Manager } from "lavaclient";
export * from "./classes";
export * from "./StereoClient";

import { PermissionString } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Configuration } from ".";
import { Queue, GuildProvider, LanguageProvider } from ".";

export interface StereoClientOptions {
  owners: string | string[];
  token: string;
  builtDirectory: string;
}

declare module "discord-akairo" {
  interface AkairoClient {
    commandHandler: CommandHandler;
    eventHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    logger: Logger;
    music: Manager;
    db: GuildProvider;
    languages: LanguageProvider;
  }
}

declare global {
  const prisma: PrismaClient;
  const config: Configuration;
}

declare module "discord.js" {
  interface Message {
    translate<T extends any>(path: string, variables?: Record<string, any>): T;
    language: string;
    prefix: string[];
  }

  interface GuildMember {
    checkPermissions(permissions?: PermissionString | PermissionString[]);
  }
}

declare module "lavaclient" {
  interface Player {
    queue: Queue;
    send(op: string, body?: any): Promise<void>;
    _connected: boolean;
    bass: "hard" | "medium" | "low" | "none";
    repeating: "song" | "queue" | "nothing";
  }
}
