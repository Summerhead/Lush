const express = require("express");
const router = express.Router();
const {
  resolveQuery,
  constructWhereClauseAnd,
  constructWhereClauseOr,
  audiosGroupBy,
  trimExtension,
  insertArtist,
} = require("../general.js");

router.post("/audioData", async function (req, res, next) {
  console.log("Body:", req.body);

  const dataRequest = req.body.dataRequest;
  const audioData = await fetchAudioData(dataRequest);

  res.send(audioData);
});

router.post("/audioBlob", async function (req, res, next) {
  const blobID = req.body.blobID;
  const audioData = await fetchAudioBlob(blobID);

  res.write(audioData.blob);
  res.end();
});

router.post("/uploadAudio", async function (req, res, next) {
  try {
    if (!req.files) {
      res.status(200).send({
        status: 200,
        message: "No file uploaded.",
      });

      return next();
    } else {
      console.log("Audio:", req.files.audio.name);

      const audio = req.files.audio;
      const name = trimExtension(audio.name);
      var title = name;
      const duration = req.body.duration;

      const separator = " - ";
      const separatorIndex = name.indexOf(separator);

      if (separatorIndex != -1) {
        var artists = name.substr(0, separatorIndex);
        title = name.substr(separatorIndex + separator.length);
      }

      const blobID = (await insertAudioBlob(audio.data)).data.insertId;
      const audioID = (await insertAudioData(blobID, title, duration)).data
        .insertId;
      await insertAudioLanguage(audioID, 1);

      if (artists) {
        const audioArtistSeparator = /, | & | [fF]?eat[.]*? /;
        const artistsArr = artists.split(audioArtistSeparator);

        for (const [index, artist] of artistsArr.entries()) {
          var artistID;
          const getArtistByNameResult = (await getArtistByName(artist)).data[0];
          if (getArtistByNameResult) {
            artistID = getArtistByNameResult.id;
          } else {
            artistID = (await insertArtist(artist)).data.insertId;
          }

          await insertAudioArtist(audioID, artistID, index + 1);
        }
      }

      res.status(200).send({
        status: 200,
        id: audioID,
        name: name,
        message: "File uploaded.",
      });
    }
  } catch (error) {
    console.log("Error:", error);

    res.status(500).send({
      status: error,
      name: audio.name,
      message: "Failed to upload.",
    });
  }
});

router.patch("/editAudio", async function (req, res) {
  console.log("Body:", req.body);

  const dataRequest = req.body.dataRequest;
  const { audioId, title, artists, genres } = dataRequest;

  await editAudioTitle(audioId, title);

  await deleteAudioArtistRelations(audioId);
  artists.forEach(async (artistID, index) => {
    if (artistID !== undefined) {
      await insertAudioArtistRelations(audioId, artistID, index + 1);
    }
  });

  await deleteAudioGenreRelations(audioId);
  genres.forEach(async (genreID, index) => {
    if (genreID !== undefined) {
      await insertAudioGenreRelations(audioId, genreID, index + 1);
    }
  });

  const audioData = await fetchAudioDataById(audioId);

  res.send(audioData);
});

async function editAudioTitle(audioID, title) {
  const query = `
  UPDATE audio
  SET title = "${title}"
  WHERE id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function fetchAudioDataById(audioID) {
  const result = await getAudioMetadataById(audioID);

  var audios = result.data?.map((audio) => ({ ...audio })) || [];
  audios = audiosGroupBy(audios, "audio_id");
  audios = Object.values(audios)[0];

  const audiosData = {
    status: result.error || 200,
    audio: audios,
  };

  return audiosData;
}

async function getAudioMetadataById(audioID) {
  const query = `
  SELECT audio_id AS audio_id, blob_id, title, artist.id AS artist_id, artist.name, duration 
  FROM audio
  INNER JOIN audio_artist 
  ON audio.id = audio_artist.audio_id
  INNER JOIN artist 
  ON audio_artist.artist_id = artist.id
  WHERE audio_id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function deleteAudioArtistRelations(audioID) {
  const query = `
  DELETE FROM audio_artist
  WHERE audio_id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function insertAudioArtistRelations(audioID, artistID, artistPosition) {
  const query = `
  INSERT INTO audio_artist(audio_id, artist_id, artist_position) 
  VALUES(${audioID}, ${artistID}, ${artistPosition})
  ;`;

  return await resolveQuery(query);
}

async function deleteAudioGenreRelations(audioID) {
  const query = `
  DELETE FROM audio_genre
  WHERE audio_id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function insertAudioGenreRelations(audioID, genreID, genrePosition) {
  const query = `
  INSERT INTO audio_genre(audio_id, genre_id, genre_position) 
  VALUES(${audioID}, ${genreID}, ${genrePosition})
  ;`;

  return await resolveQuery(query);
}

async function fetchAudioData(dataRequest) {
  const result = await getAudioMetadata(dataRequest);

  const status = result.error || 200;
  var audios = result.data?.map((audio) => ({ ...audio })) || [];
  audios = audiosGroupBy(audios, "audio_id");
  audios = Array.from(audios.values());
  audios.forEach((audio) => {
    audio.artists = Object.values(audio.artists);
    audio.artists.sort((a, b) => a.position - b.position);

    audio.genres = Object.values(audio.genres);
    audio.genres.sort((a, b) => a.position - b.position);
  });

  const audiosData = {
    status: status,
    audios: audios,
  };

  return audiosData;
}

async function fetchAudioBlob(blobID) {
  const result = await getAudio(blobID),
    audioData = {
      status: result.error || 200,
      blob: result.data[0].audio,
    };

  return audioData;
}

async function getAudioMetadata({
  artistID,
  playlistID,
  search,
  genres,
  shuffle,
  limit,
  offset,
}) {
  const queryWhereClauses = [];
  const subqueryWhereClauses = [];
  var orderBy = "";

  if (artistID) {
    const artistIDWhereClause = `
    artist.id = ${artistID}
    `;

    queryWhereClauses.push(artistIDWhereClause);
    subqueryWhereClauses.push(artistIDWhereClause);
  }

  if (playlistID) {
    const playlistIDWhereClause = `
    playlist.id = ${playlistID}
    `;

    queryWhereClauses.push(playlistIDWhereClause);
    subqueryWhereClauses.push(playlistIDWhereClause);
  }

  if (search) {
    const searchQuery = `
      CONCAT(artist.name, " ", audio.title) COLLATE utf8mb4_0900_ai_ci LIKE "%${search}%"
      `;
    //   `
    // (
    //   audio.title COLLATE utf8mb4_0900_ai_ci LIKE "%${search}%"
    //   OR artist.name COLLATE utf8mb4_0900_ai_ci LIKE "%${search}%"
    // )
    // `;

    queryWhereClauses.push(searchQuery);
    subqueryWhereClauses.push(searchQuery);
  }

  if (genres) {
    const queryWhereClausesOr = [];
    const subqueryWhereClausesOr = [];

    genres.forEach((genre) => {
      const genreQuery = `
      genre.name = "${genre}"
      `;
      subqueryWhereClausesOr.push(genreQuery);
      queryWhereClausesOr.push(genreQuery);
    });

    const genresSubquery = constructWhereClauseOr(subqueryWhereClausesOr);
    const genresQuery = constructWhereClauseOr(queryWhereClausesOr);

    subqueryWhereClauses.push(genresSubquery);
    queryWhereClauses.push(genresQuery);
  }

  const queryWhereClause = constructWhereClauseAnd(queryWhereClauses);

  if (shuffle) {
    orderBy = "RAND()";
  } else {
    orderBy = "audio.id DESC";
    const subquery = `
    audio.id <= 
      (
        SELECT audio.id 
        FROM audio 

        LEFT JOIN audio_artist 
        ON audio.id = audio_artist.audio_id
        LEFT JOIN artist 
        ON audio_artist.artist_id = artist.id
        
        LEFT JOIN audio_playlist 
        ON audio.id = audio_playlist.audio_id
        LEFT JOIN playlist 
        ON audio_playlist.playlist_id = playlist.id
        
        LEFT JOIN audio_genre 
        ON audio.id = audio_genre.audio_id
        LEFT JOIN genre 
        ON audio_genre.genre_id = genre.id

        ${queryWhereClause}
        GROUP BY audio.id
        ORDER BY audio.id DESC
        LIMIT 1 OFFSET ${offset}
      )
    `;

    subqueryWhereClauses.push(subquery);
  }

  const subqueryWhereClause = constructWhereClauseAnd(subqueryWhereClauses);

  const query = `
  SELECT audio.id AS audio_id, blob_id, title, artist.id AS artist_id, artist.name, 
  CONCAT(title, " ", artist.name) AS fullAudioTitle, artist_position, duration, 
  genre.id AS genre_id, genre.name AS genre_name, audio_genre.genre_position AS genre_position
  FROM (
    SELECT audio.id, blob_id, title, duration 
    FROM audio
    
    LEFT JOIN audio_artist 
    ON audio.id = audio_artist.audio_id
    LEFT JOIN artist 
    ON audio_artist.artist_id = artist.id
    
    LEFT JOIN audio_playlist 
    ON audio.id = audio_playlist.audio_id
    LEFT JOIN playlist 
    ON audio_playlist.playlist_id = playlist.id
    
    LEFT JOIN audio_genre 
    ON audio.id = audio_genre.audio_id
    LEFT JOIN genre 
    ON audio_genre.genre_id = genre.id

    ${subqueryWhereClause}
    GROUP BY audio.id
    ORDER BY ${orderBy}
    LIMIT ${limit}
    )
  audio

  LEFT JOIN audio_artist 
  ON audio.id = audio_artist.audio_id
  LEFT JOIN artist 
  ON audio_artist.artist_id = artist.id

  LEFT JOIN audio_playlist 
  ON audio.id = audio_playlist.audio_id
  LEFT JOIN playlist 
  ON audio_playlist.playlist_id = playlist.id
  
  LEFT JOIN audio_genre 
  ON audio.id = audio_genre.audio_id
  LEFT JOIN genre 
  ON audio_genre.genre_id = genre.id
  ;`;

  // console.log(query);

  return await resolveQuery(query);
}

async function getAudio(audioID) {
  const query = `
  SELECT audio
  FROM audio_blob
  WHERE id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function insertAudioLanguage(audioID, languageID) {
  const query = `
  INSERT INTO audio_language(audio_id, language_id) 
  VALUES(${audioID}, ${languageID})
  ;`;

  return await resolveQuery(query);
}

async function insertAudioArtist(audioID, artistID, artistPosition) {
  const query = `
  INSERT INTO audio_artist(audio_id, artist_id, artist_position) 
  VALUES(${audioID}, ${artistID}, ${artistPosition})
  ;`;

  return await resolveQuery(query);
}

async function getArtistByName(artist) {
  const query = `
  SELECT id 
  FROM artist 
  WHERE deleted = 0
  AND name COLLATE utf8mb4_0900_ai_ci LIKE "%${artist}%"
  ;`;

  return await resolveQuery(query);
}

async function insertAudioData(blobID, title, duration) {
  const query = `
  INSERT INTO audio(blob_id, title, duration) 
  VALUES("${blobID}", "${title}", "${duration}")
  ;`;

  return await resolveQuery(query);
}

async function insertAudioBlob(audio) {
  const query = `
  INSERT INTO audio_blob SET ?
  `,
    values = {
      audio: audio,
    };

  return await resolveQuery(query, values);
}

async function getNumOfRows() {
  const query = `
  SELECT COUNT(*) 
  FROM audio
  ;`;

  await resolveQuery(query);
}

async function setTag(artistID) {
  const query = `
  CALL INSERT_AUDIO_TAG_RELATIONS(${artistID});
  `;

  return await resolveQuery(query);
}

router.post("/setTag", async function (req, res, next) {
  console.log("Body:", req.body);

  const artistID = req.body.artistID,
    result = await setTag(artistID),
    audiosData = {
      status: result.error || 200,
      audios: result.data,
    };

  res.send(audiosData);
});

module.exports = router;
