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

module.exports = { mapAlbums, mapSongs };
