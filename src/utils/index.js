const mapAlbums = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapSongs = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const mapPlaylists = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = { mapAlbums, mapSongs, mapPlaylists };
