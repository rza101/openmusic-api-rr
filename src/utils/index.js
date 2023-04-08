/* eslint-disable camelcase */
const mapSongsDBToSongModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});

module.exports = { mapSongsDBToSongModel };
