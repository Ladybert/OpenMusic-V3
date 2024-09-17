const mapAlbums = ({ id, name, year, coverUrl }) => ({
  id,
  name,
  year,
  coverUrl,
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

const mapPlaylists = ({ id, name, username }) => ({
  id,
  name,
  username,
});

const mapPlaylistActivities = ({ username, title, action, time }) => ({
  username,
  title,
  action,
  time,
});

const mapAlbumLikes = ({ totalLikes }) => ({ totalLikes });

module.exports = {
  mapAlbums,
  mapSongs,
  mapPlaylists,
  mapPlaylistActivities,
  mapAlbumLikes,
};
