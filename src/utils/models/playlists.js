/* eslint-disable camelcase */

const mapPlaylistsTableToModel = ({
  id, name, username,
}) => ({
  id,
  name,
  username,
});

module.exports = { mapPlaylistsTableToModel };
