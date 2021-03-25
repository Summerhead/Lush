const express = require("express");
const router = express.Router();
const { resolveQuery, constructWhereClauseAnd } = require("../general.js");

router.post("/playlistsData", async function (req, res, next) {
  console.log("Body:", req.body);

  const dataRequest = req.body.dataRequest;

  const result = await getPlaylists(dataRequest),
    playlists = result.data?.map((playlist) => ({ ...playlist })) || [],
    status = result.error || 200,
    playlistsData = {
      status: status,
      playlists: playlists,
    };

  res.send(playlistsData);
});

async function getPlaylists({ playlistID, search, limit, offset }) {
  var playlistIDWhereClause = "",
    queryWhereClauses = [],
    subquery = "",
    subqueryWhereClauses = [],
    searchQuery = "";

  const whereClauseDeleted = "playlist.deleted = 0";
  queryWhereClauses.push(whereClauseDeleted);
  subqueryWhereClauses.push(whereClauseDeleted);

  if (search) {
    searchQuery = `
      (
        playlist.name COLLATE utf8mb4_0900_ai_ci LIKE "%${search}%"
      )`;

    queryWhereClauses.push(searchQuery);
    subqueryWhereClauses.push(searchQuery);
  }

  if (playlistID) {
    playlistIDWhereClause = `
      playlist.id = ${playlistID}
      `;

    queryWhereClauses.push(playlistIDWhereClause);
    subqueryWhereClauses.push(playlistIDWhereClause);
  } else {
    const subqueryWhereClause = constructWhereClauseAnd(subqueryWhereClauses);

    subquery = `
      playlist.id <= 
      (
        SELECT playlist.id 
        FROM playlist 
        ${subqueryWhereClause}
        ORDER BY playlist.id DESC
        LIMIT 1 OFFSET ${offset}
      )`;

    queryWhereClauses.push(subquery);
  }

  const queryWhereClause = constructWhereClauseAnd(queryWhereClauses);

  const query = `
    SELECT playlist.id AS playlist_id, name, blob_id
    FROM (
      SELECT playlist.id, name
      FROM playlist
      ${queryWhereClause}
      ORDER BY playlist.id DESC
      LIMIT ${limit}
      )
    playlist
    LEFT JOIN image_playlist
    ON playlist.id = image_playlist.playlist_id
    LEFT JOIN playlistimage
    ON playlistimage.id = image_playlist.image_id
    ;`;

  // console.log(query);

  return await resolveQuery(query);
}

router.post("/submitPlaylist", async function (req, res, next) {
  console.log("Body:", req.body);
  console.log("Body:", req.files);

  const playlistMetadata = JSON.parse(req.body.playlistMetadata);
  var playlistID = playlistMetadata.playlistID;
  const playlistName = playlistMetadata.playlistName.replace('"', '\\"');
  // Need to improve character escaping
  const image = req.files?.image;

  if (playlistID) {
    await editPlaylist(playlistID, playlistName);
  } else {
    playlistID = (await insertPlaylist(playlistName)).data.insertId;
  }

  if (image) {
    console.log("Has image.");
    // const blobID = (await insertImageBlob(image.data)).data.insertId;
    // const imageID = await (await insertImageData(blobID)).data.insertId;
    // await insertImagePlaylist(imageID, playlistID);
  }

  res.send({
    status: 200,
    message: "File uploaded.",
    playistID: playlistID,
    playistName: playlistName,
  });
});

async function editPlaylist(playlistID, playlistName) {
  const query = `
  UPDATE playlist
  SET name = "${playlistName}"
  WHERE id = ${playlistID}
  ;`;

  return await resolveQuery(query);
}

async function insertPlaylist(playlistName) {
  const query = `
  INSERT INTO playlist(name)
  VALUES("${playlistName}")
  ;`;

  return await resolveQuery(query);
}

router.delete("/deletePlaylist", async function (req, res, next) {
  console.log("Body:", req.body);

  const playlistID = req.body.playlistID,
    result = await deletePlaylist(playlistID),
    playlistsData = {
      status: result.error || 200,
      playlists: result.data,
    };

  res.send(playlistsData);
});

async function deletePlaylist(playlistID) {
  const query = `
  UPDATE playlist
  SET deleted = 1
  WHERE id = ${playlistID}
  ;`;

  return await resolveQuery(query);
}

module.exports = router;
