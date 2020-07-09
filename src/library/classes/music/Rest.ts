import { LoadTrackResponse } from "@kyflx-dev/lavalink-types";
import fetch from "node-fetch";

export class Rest {
  public static async resolve(track: string): Promise<LoadTrackResponse> {
    const { host, port, password } = config.get("nodes")[0];
    if (
      /(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/track\/([a-z0-9\d-_]+)/gi.test(
        track
      )
    ) {
      const arr = track.split(
        /https?:\/\/(www\.)?open\.spotify\.com\/track\//gi
      );

      const result = arr[arr.length - 1].match(/([a-z0-9\d-_]+)/gi)[0];

      if (!result)
        //@ts-ignore
        return {
          loadType: "NO_MATCHES",
        };

      const token = await getSpotifyToken();

      const song = await (
        await fetch(`https://api.spotify.com/v1/tracks/${result}`, {
          headers: {
            authorization: `${token.tokenType} ${token.accessToken}`,
            "User-Agent": "Nyro Discord Bot (NodeJS, v3.0.0)",
            "Content-Type": "application/json",
          },
        })
      ).json();

      if (!song)
        //@ts-ignore
        return {
          loadType: "NO_MATCHES",
        };

      const { tracks, loadType } = await Rest.resolve(
        encodeURIComponent(`ytsearch:${song.artists[0].name} - ${song.name}`)
      );

      if (["NO_MATCHES", "LOAD_FAILED"].includes(loadType))
        //@ts-ignore
        return { loadType: "NO_MATCHES" };

      return { loadType: "TRACK_LOADED", tracks };
    }

    return await (
      await fetch(`http://${host}:${port}/loadtracks?identifier=${track}`, {
        headers: {
          authorization: password,
        },
      })
    ).json();
  }
}

const getSpotifyToken = () => {
  return fetch(
    `https://accounts.spotify.com/api/token?grant_type=client_credentials`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(
          `${config.get("bot.tokens.spotify.id")}:${config.get(
            "bot.tokens.spotify.secret"
          )}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((r) => r.json())
    .then((data) => {
      const { access_token, expires_in, token_type } = data;

      return {
        accessToken: access_token,
        expiresIn: expires_in,
        tokenType: token_type,
        expiresAt: new Date(new Date().getTime() + (expires_in - 2000) * 1000),
      };
    });
};
