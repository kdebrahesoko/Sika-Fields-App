import { defineField, defineType } from "sanity";
import { RestoreIcon } from "@sanity/icons";

export const restoreAudit = defineType({
  name: "restoreAudit",
  title: "Restore Audit Log",
  type: "document",
  icon: RestoreIcon,
  readOnly: true,
  fields: [
    defineField({ name: "postId", title: "Post ID", type: "string" }),
    defineField({ name: "postType", title: "Post Type", type: "string" }),
    defineField({ name: "postTitle", title: "Post Title", type: "string" }),
    defineField({ name: "revisionId", title: "Revision ID", type: "string" }),
    defineField({
      name: "revisionTimestamp",
      title: "Revision Timestamp",
      type: "datetime",
    }),
    defineField({
      name: "restoredAt",
      title: "Restored At",
      type: "datetime",
    }),
    defineField({
      name: "restoredBy",
      title: "Restored By",
      type: "object",
      fields: [
        defineField({ name: "id", type: "string", title: "User ID" }),
        defineField({ name: "name", type: "string", title: "Name" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "postTitle",
      restoredAt: "restoredAt",
      name: "restoredBy.name",
    },
    prepare({ title, restoredAt, name }) {
      const when = restoredAt
        ? new Date(restoredAt).toLocaleString("en-GB")
        : "";
      return {
        title: title ?? "(untitled post)",
        subtitle: `Restored by ${name ?? "Admin"} · ${when}`,
      };
    },
  },
});
