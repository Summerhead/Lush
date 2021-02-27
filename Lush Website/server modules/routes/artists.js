const express = require("express");
const router = express.Router();
const { resolveQuery, constructWhereClause } = require("../general.js");

router.post("/artistsData", async (req, res, next) => {
  console.log("Body:", req.body);

  const params = {
    artistID: req.body.artistID,
    search: req.body.search?.replace('"', '\\"'), // Need to fix character escaping
    limit: req.body.limit,
    offset: req.body.offset,
  };

  const result = await getArtistsData(params),
    artists = result.data?.map((artist) => ({ ...artist })) || [],
    status = result.error || 200,
    resJSON = {
      status: status,
      artists: artists,
    };

  res.send(resJSON);
});

router.post("/imageBlob", async (req, res, next) => {
  const blobID = req.body.blobID,
    audioData = await fetchImageBlob(blobID);

  res.write(audioData.blob);
  res.end();
});

async function insertArtistImageBlob(image) {
  const query = `
  INSERT INTO artistimage_blob SET ?
  `,
    values = {
      image: image,
    };

  return await resolveQuery(query, values);
}

async function insertArtistImageData(blobID) {
  const query = `
  INSERT INTO artistimage(blob_id) 
  VALUES("${blobID}")
  ;`;

  return await resolveQuery(query);
}

async function insertImageArtist(imageID, artistID) {
  const query = `
  INSERT INTO image_artist(image_id, artist_id) 
  VALUES(${imageID}, ${artistID})
  ;`;

  return await resolveQuery(query);
}

async function getArtistsData({ artistID, search, limit, offset }) {
  var artistIDWhereClause = "",
    queryWhereClauses = [],
    subquery = "",
    subqueryWhereClauses = [],
    searchQuery = "";

  const whereClauseDeleted = "artist.deleted = 0";
  queryWhereClauses.push(whereClauseDeleted);
  subqueryWhereClauses.push(whereClauseDeleted);

  if (search) {
    searchQuery = `
    (
      artist.name COLLATE utf8mb4_0900_ai_ci LIKE "%${search}%"
    )`;

    queryWhereClauses.push(searchQuery);
    subqueryWhereClauses.push(searchQuery);
  }

  if (artistID) {
    artistIDWhereClause = `
    artist.id = ${artistID}
    `;

    queryWhereClauses.push(artistIDWhereClause);
    subqueryWhereClauses.push(artistIDWhereClause);
  } else {
    const subqueryWhereClause = constructWhereClause(subqueryWhereClauses);

    subquery = `
    artist.id <= 
    (
      SELECT artist.id 
      FROM artist 
      ${subqueryWhereClause}
      ORDER BY artist.id DESC
      LIMIT 1 OFFSET ${offset}
    )`;

    queryWhereClauses.push(subquery);
  }

  const queryWhereClause = constructWhereClause(queryWhereClauses);

  const query = `
  SELECT artist.id AS artist_id, name, blob_id
  FROM (
    SELECT artist.id, name
    FROM artist
    ${queryWhereClause}
    ORDER BY artist.id DESC
    LIMIT ${limit}
    )
  artist
  LEFT JOIN image_artist
  ON artist.id = image_artist.artist_id
  LEFT JOIN artistimage
  ON artistimage.id = image_artist.image_id
  ;`;

  // console.log(query);

  return await resolveQuery(query);
}

async function fetchImageBlob(blobID) {
  const result = await getArtistImageBlob(blobID),
    audioData = {
      status: result.error || 200,
      blob: result.data[0]?.image || new Uint8Array(0),
    };

  return audioData;
}

async function getArtistImageBlob(blobID) {
  const query = `
  SELECT image
  FROM artistimage_blob
  WHERE id = ${blobID}
  ;`;

  return await resolveQuery(query);
}

router.post("/submitArtist", async function (req, res) {
  console.log("Body:", req.body);
  console.log("Body:", req.files);

  const artistMetadata = JSON.parse(req.body.artistMetadata);
  var artistID = artistMetadata.artistID;
  const artistName = artistMetadata.artistName.replace('"', '\\"');
  // Need to improve character escaping
  const image = req.files?.image;

  if (artistID) {
    await editArtist(artistID, artistName);
  } else {
    artistID = (await insertArtist(artistName)).data.insertId;
  }

  if (image) {
    const blobID = (await insertArtistImageBlob(image.data)).data.insertId;
    const imageID = await (await insertArtistImageData(blobID)).data.insertId;
    await insertImageArtist(imageID, artistID);
  }

  res.send({
    status: 200,
    message: "File uploaded.",
    artistID: artistID,
    artistName: artistName,
  });
});

async function editArtist(artistID, artistName) {
  const query = `
  UPDATE artist
  SET name = "${artistName}"
  WHERE id = ${artistID}
  ;`;

  return await resolveQuery(query);
}

router.delete("/deleteArtist", async function (req, res, next) {
  console.log("Body:", req.body);

  const artistID = req.body.artistID,
    result = await deleteArtist(artistID),
    audiosData = {
      status: result.error || 200,
      audios: result.data,
    };

  res.send(audiosData);
});

async function deleteArtist(artistID) {
  const query = `
  UPDATE artist
  SET deleted = 1
  WHERE id = ${artistID}
  ;`;

  return await resolveQuery(query);
}

module.exports = router;
