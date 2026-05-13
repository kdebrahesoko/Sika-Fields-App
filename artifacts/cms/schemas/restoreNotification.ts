import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons";

export const restoreNotification = defineType({
  name: "restoreNotification",
  title: "Restore Notification",
  type: "document",
  icon: BellIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "notifyUserId",
      title: "Recipient User ID",
      type: "string",
      description:
        "The Clerk user ID of the admin whose revision was reverted.",
    }),
    defineField({
      name: "notifyUserName",
      title: "Recipient Name",
      type: "string",
    }),
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
    defineField({
      name: "readAt",
      title: "Read At",
      type: "datetime",
      description: "Set when the recipient marks the notification as read.",
    }),
  ],
  preview: {
    select: {
      title: "postTitle",
      restoredAt: "restoredAt",
      restorer: "restoredBy.name",
      recipient: "notifyUserName",
    },
    prepare({ title, restoredAt, restorer, recipient }) {
      const when = restoredAt
        ? new Date(restoredAt).toLocaleString("en-GB")
        : "";
      return {
        title: title ?? "(untitled post)",
        subtitle: `${restorer ?? "Admin"} reverted ${recipient ?? "an admin"}'s edit · ${when}`,
      };
    },
  },
});
