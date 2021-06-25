const router = require("express").Router();
const {
  resolveQuery,
  constructWhereClauseAnd,
  insertArtist,
  artistsGroupBy,
} = require("../general.js");
const { uploadImageToGoogleDrive } = require("../googleDrive.js");

router.post("/artistsForDropdown", async function (req, res) {
  console.log("Body:", req.body);

  const artistName = req.body.artistName;
  const result = await getArtists(artistName);
  const status = result.error || 200;
  const artists = result.data?.map((artist) => ({ ...artist })) || [];
  const resJSON = {
    status: status,
    artists: artists,
  };

  res.send(resJSON);
});

router.post("/artistsData", async (req, res) => {
  // console.log("Body:", req.body);

  const dataRequest = req.body.dataRequest;
  const result = await getArtistsData(dataRequest);

  const status = result.error || 200;
  var artists = result.data?.map((artist) => ({ ...artist })) || [];
  artists = artistsGroupBy(artists, "artist_id");
  artists = Array.from(artists.values());
  artists.forEach((artist) => {
    artist.genres = Object.values(artist.genres);
    artist.genres.sort((a, b) => a.genre_position - b.genre_position);
  });

  const artistData = {
    status: status,
    artists: artists,
  };

  res.send(artistData);
});

router.post("/imageBlob", async (req, res) => {
  const blobId = req.body.blobId;
  const audioData = await fetchImageBlob(blobId);

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

async function getArtists(artistName) {
  const whereClauses = ["deleted = 0"];

  if (artistName) {
    artistName = artistName
      .replace("\\", "\\\\\\\\")
      .replace("'", "\\'")
      .replace('"', '\\"')
      .replace("%", "\\%");
    // Need to fix character escaping
    // console.log(artistName);

    whereClauses.push(
      `artist.name COLLATE utf8mb4_0900_ai_ci LIKE "%${artistName}%"`
    );
  }

  const whereClause = constructWhereClauseAnd(whereClauses);

  const query = `
  SELECT id, name
  FROM artist
  ${whereClause}
  ORDER BY id DESC
  ;`;

  return await resolveQuery(query);
}

async function insertArtistImageData(imageId) {
  const query = `
  INSERT INTO artistimage_b(image_id) 
  VALUES("${imageId}")
  ;`;

  return await resolveQuery(query);
}

async function insertImageArtist(imageId, artistId) {
  const query = `
  INSERT INTO image_artist_b(image_id, artist_id) 
  VALUES(${imageId}, ${artistId})
  ;`;

  return await resolveQuery(query);
}

async function getArtistsData({ artistId, search, limit, offset }) {
  var artistIdWhereClause = "",
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

  if (artistId) {
    artistIdWhereClause = `
    artist.id = ${artistId}
    `;

    queryWhereClauses.push(artistIdWhereClause);
    subqueryWhereClauses.push(artistIdWhereClause);
  } else {
    const subqueryWhereClause = constructWhereClauseAnd(subqueryWhereClauses);

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

  const queryWhereClause = constructWhereClauseAnd(queryWhereClauses);

  const query = `
  SELECT artist.id AS artist_id, artist.name AS artist_name, artistimage_b.image_id AS image_id, 
  genre.id AS genre_id, genre.name AS genre_name,
  artistimage_b.r, artistimage_b.g, artistimage_b.b
  FROM (
    SELECT artist.id, name
    FROM artist
    ${queryWhereClause}
    ORDER BY artist.id DESC
    LIMIT ${limit}
    )
  artist

  LEFT JOIN image_artist_b
  ON artist.id = image_artist_b.artist_id
  AND is_cover = 1
  LEFT JOIN artistimage_b
  ON artistimage_b.id = image_artist_b.image_id
  
  LEFT JOIN audio_artist 
  ON artist.id = audio_artist.artist_id
  LEFT JOIN audio 
  ON audio_artist.audio_id = audio.id
  
  LEFT JOIN audio_genre 
  ON audio.id = audio_genre.audio_id
  LEFT JOIN genre 
  ON audio_genre.genre_id = genre.id
  ;`;

  // console.log(query);

  return await resolveQuery(query);
}

async function fetchImageBlob(blobId) {
  const result = await getArtistImageBlob(blobId);
  const audioData = {
    status: result.error || 200,
    blob: result.data[0]?.image || new Uint8Array(0),
  };

  return audioData;
}

async function getArtistImageBlob(blobId) {
  const query = `
  SELECT image
  FROM artistimage_blob
  WHERE id = ${blobId}
  ;`;

  return await resolveQuery(query);
}

router.post("/submitArtist", async function (req, res) {
  const artistMetadata = JSON.parse(req.body.artistMetadata);
  var artistId = artistMetadata.artistId;
  const artistName = artistMetadata.artistName?.replace('"', '\\"'); // Need to improve character escaping
  const image = req.files?.image;
  const genres = artistMetadata.genres;
  const rgb = artistMetadata.rgb;

  if (artistId) {
    await editArtist(artistId, artistName);
  } else {
    artistId = (await insertArtist(artistName)).data.insertId;
  }

  if (image) {
    // const blobId = (await insertArtistImageBlob(image.data)).data.insertId;
    const googleDriveImageId = await uploadImageToGoogleDrive(
      "artists_images",
      artistName,
      image
    );
    const imageId = (
      await insertArtistImageDataGoogleDrive(googleDriveImageId, rgb)
    ).data.insertId;
    await insertImageArtistGoogleDrive(imageId, artistId);
  }

  await deleteAudioGenreRelations(artistId);
  genres.forEach(async (genreId, index) => {
    await setGenre(artistId, genreId, index + 1);
  });

  res.send({
    status: 200,
    message: "File uploaded.",
    artistId: artistId,
    artistName: artistName,
  });
});

async function insertArtistImageDataGoogleDrive(imageId, { r, g, b }) {
  const query = `
  INSERT INTO artistimage_b(image_id, r, g, b) 
  VALUES("${imageId}", ${r}, ${g}, ${b})
  ;`;

  return await resolveQuery(query);
}

async function insertImageArtistGoogleDrive(imageId, artistId) {
  const query = `
  INSERT INTO image_artist_b(image_id, artist_id) 
  VALUES(${imageId}, ${artistId})
  ;`;

  return await resolveQuery(query);
}

async function deleteAudioGenreRelations(artistId) {
  const query = `
  CALL DELETE_AUDIO_GENRE_RELATIONS(${artistId})
  ;`;

  return await resolveQuery(query);
}

async function editArtist(artistId, artistName) {
  const query = `
  UPDATE artist
  SET name = "${artistName}"
  WHERE id = ${artistId}
  ;`;

  return await resolveQuery(query);
}

async function setGenre(artistId, genreId, genrePosition) {
  const query = `
  CALL INSERT_AUDIO_TAG_RELATIONS(${artistId}, ${genreId}, ${genrePosition});
  `;

  return await resolveQuery(query);
}

router.delete("/deleteArtist", async function (req, res) {
  console.log("Body:", req.body);

  const artistId = req.body.artistId,
    result = await deleteArtist(artistId),
    audiosData = {
      status: result.error || 200,
      audios: result.data,
    };

  res.send(audiosData);
});

async function deleteArtist(artistId) {
  const query = `
  UPDATE artist
  SET deleted = 1
  WHERE id = ${artistId}
  ;`;

  return await resolveQuery(query);
}

router.post("/uploadRGB", async function (req, res) {
  const { r, g, b } = req.body.rgb;
  const id = req.body.id;
  await insertRGB(id, r, g, b);

  res.send({ id: id, rgb: { r, g, b } });
});

async function insertRGB(id, r, g, b) {
  const query = `
  UPDATE artistimage_b
  SET r = ${r}, g = ${g}, b = ${b}
  WHERE id = ${id}
  ;`;

  return await resolveQuery(query);
}

module.exports = router;
