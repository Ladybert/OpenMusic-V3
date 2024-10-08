exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: '"users"',
      onDelete: "CASCADE",
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: false,
      references: '"albums"',
      onDelete: "CASCADE",
    },
  });
  pgm.addConstraint(
    "user_album_likes",
    "fk_user_album_likes.user_id_users.id",
    "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE",
  );
  pgm.addConstraint(
    "user_album_likes",
    "fk_user_album_likes.album_id_albums.id",
    "FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE",
  );
};

exports.down = (pgm) => {
  pgm.dropTable("user_album_likes");
  pgm.dropConstraint(
    "user_album_likes",
    "fk_user_album_likes.user_id_users.id",
  );
  pgm.dropConstraint(
    "user_album_likes",
    "fk_user_album_likes.album_id_albums.id",
  );
};
