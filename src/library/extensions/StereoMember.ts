import { Structures, PermissionString, Permissions } from "discord.js";

export default Structures.extend(
  "GuildMember",
  (GuildMember) =>
    class StereoMember extends GuildMember {
      public checkPermissions(
        permissions?: PermissionString | PermissionString[]
      ) {
        if (!permissions) return false;
        const perms = new Permissions(this.permissions.bitfield).toArray();
        if (!perms) return false;

        return Array.isArray(permissions)
          ? perms.some((perm) => this.permissions.has(perm))
          : this.permissions.has(perms);
      }
    }
);
