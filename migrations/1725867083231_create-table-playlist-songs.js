/* eslint-disable no-unused-vars */

exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true, // Primary key hanya untuk kolom id
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true, // playlist_id harus bernilai NOT NULL
      references: '"playlists"', // referensi ke tabel playlists
      onDelete: "CASCADE", // Jika playlist dihapus, entri terkait juga dihapus
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true, // song_id harus bernilai NOT NULL
      references: '"songs"', // referensi ke tabel songs
      onDelete: "CASCADE", // Jika song dihapus, entri terkait juga dihapus
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
