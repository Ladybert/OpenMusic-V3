/* eslint-disable no-unused-vars */

exports.up = (pgm) => {
    pgm.createTable("playlist_songs", {
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
      
      // Menambahkan composite primary key dari playlist_id dan song_id
      pgm.addConstraint("playlist_songs", "primary_key_playlist_id_song_id", {
        primaryKey: ["playlist_id", "song_id"],
      });
      
};

exports.down = (pgm) => {
  pgm.dropTable("playlists_songs");
};
