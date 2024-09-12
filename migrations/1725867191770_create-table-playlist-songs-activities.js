/* eslint-disable no-unused-vars */

const { options } = require("joi");

exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: '"playlists"',
      onDelete: "CASCADE",
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: '"songs"',
      onDelete: "CASCADE",
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: '"users"',
      onDelete: "CASCADE",
    },
    action: {
      type: "TEXT",
      notNull: false,
    },
    time: {
      type: "DATE",
      notNull: false,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
