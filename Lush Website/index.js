const mysql2 = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const express = require("express");
const app = express();
const server = require("http").createServer(app);

const connection = mysql2.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "beautyofbalance",
  database: "lush",
});

server.listen(5501);

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/public", express.static("public"));

app.use(bodyParser.json());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  fileUpload({
    createParentPath: true,
  })
);

const pagesJSON = JSON.parse(fs.readFileSync("./pages.json"));

for (const [link, path] of Object.entries(pagesJSON)) {
  app.post(link, function (req, res) {
    res.send(path);
  });
}

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/music", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/artists", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/artists/:artist_id/:artist_name", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/genres", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/playlists", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.post("/artistsForDropdown", async function (req, res, next) {
  const artistName = req.body.artistName;
  const result = await getArtists(artistName),
    artists = result.data || [],
    error = result.error,
    resJSON = {
      status: error || 200,
      artists: [],
    };

  for (const artist of artists) {
    resJSON.artists.push({ ...artist });
  }

  res.send(resJSON);
});

async function getArtists(artistName) {
  var whereArtist = "";
  if (artistName) {
    whereArtist = `WHERE artist.name COLLATE utf8mb4_0900_ai_ci LIKE '%${artistName}%'`;
  }

  const query = `
  SELECT id, name
  FROM artist
  ${whereArtist}
  ORDER BY id DESC
  ;`;

  return await resolveQuery(query);
}

async function resolveQuery(query, values) {
  var err, res;

  try {
    await Promise.resolve(executeQuery(query, values)).then(
      (result) => (res = result),
      (error) => (err = error)
    );
  } catch (error) {
    err = error;
    console.log("Error:", error);
  }

  return { error: err, data: res };
}

function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, function (error, result) {
      if (error) {
        console.log("Error:", error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

app.post("/audioData", async function (req, res, next) {
  console.log("Body:", req.body);

  const params = {};
  [params.artistID, params.search, params.limit, params.offset] = [
    req.body.artistID,
    req.body.search,
    req.body.limit,
    req.body.offset,
  ];

  const audioData = await fetchAudioData(params);

  res.send(audioData);
});

app.post("/audioBlob", async function (req, res, next) {
  const blobID = req.body.blobID,
    audioData = await fetchAudioBlob(blobID);

  res.write(audioData.blob);
  res.end();
});

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    rv[x[key]] = rv[x[key]] || { artists: [] };
    rv[x[key]].audio_id = x.audio_id;
    rv[x[key]].blob_id = x.blob_id;
    rv[x[key]].title = x.title;
    rv[x[key]].artists.push({ artist_id: x.artist_id, name: x.name });
    rv[x[key]].duration = x.duration;
    return rv;
  }, {});
};

async function fetchAudioData(params) {
  const result = await getAudioMetadata(params),
    audiosSpread = result.data.map((audio) => ({ ...audio })) || [],
    audiosGrouped = groupBy(audiosSpread, "audio_id"),
    audiosValues = Object.values(audiosGrouped).reverse(),
    audiosData = {
      status: result.error || 200,
      audios: audiosValues,
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

async function getNumOfRows() {
  const query = `
  SELECT COUNT(*) 
  FROM audio
  ;`;

  await resolveQuery(query);
}

function constructWhereClause(whereClauses) {
  return whereClauses.length
    ? "WHERE " + [whereClauses[0], ...whereClauses.slice(1)].join(" AND ")
    : "";
}

async function getAudioMetadata({ artistID, search, limit, offset }) {
  var artistIDWhereClause = "",
    searchQuery = "",
    queryWhereClauses = [],
    subqueryWhereClauses = [],
    concatedArtists = "";

  if (artistID) {
    // concatedArtists = "GROUP_CONCAT(artist.name) AS name, ";

    artistIDWhereClause = `
    artist.id = ${artistID}
    `;

    queryWhereClauses.push(artistIDWhereClause);
    subqueryWhereClauses.push(artistIDWhereClause);
  }

  if (search) {
    searchQuery = `
    (
      audio.title COLLATE utf8mb4_0900_ai_ci LIKE '%${search}%'
      OR artist.name COLLATE utf8mb4_0900_ai_ci LIKE '%${search}%'
    )
    `;

    queryWhereClauses.push(searchQuery);
    subqueryWhereClauses.push(searchQuery);
  }

  const queryWhereClause = constructWhereClause(queryWhereClauses);

  const subquery = `
  audio.id <= 
    (
      SELECT audio.id 
      FROM audio 
      INNER JOIN audio_artist 
      ON audio.id = audio_artist.audio_id
      INNER JOIN artist 
      ON audio_artist.artist_id = artist.id
      ${queryWhereClause}
      GROUP BY audio.id
      ORDER BY audio.id DESC
      LIMIT 1 OFFSET ${offset}
    )
  `;

  subqueryWhereClauses.push(subquery);

  const subqueryWhereClause = constructWhereClause(subqueryWhereClauses);

  const query = `
  SELECT audio_id AS audio_id, blob_id, title, artist.id AS artist_id, artist.name, duration 
  FROM (
    SELECT audio.id, blob_id, title, ${concatedArtists}duration 
    FROM audio
    INNER JOIN audio_artist 
    ON audio.id = audio_artist.audio_id
    INNER JOIN artist 
    ON audio_artist.artist_id = artist.id
    ${subqueryWhereClause}
    GROUP BY audio.id
    ORDER BY audio.id DESC
    LIMIT ${limit}
    )
  audio
  INNER JOIN audio_artist 
  ON audio.id = audio_artist.audio_id
  INNER JOIN artist 
  ON audio_artist.artist_id = artist.id
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

async function getArtistsByAudioID(audioID) {
  const query = `
  SELECT artist.id, name, artist_position 
  FROM artist
    LEFT JOIN audio_artist 
    ON artist.id = artist_id
    LEFT JOIN audio
    ON audio.id = audio_id
  WHERE audio.id = ${audioID}
  ORDER BY artist_position
  ;`;

  return await resolveQuery(query);
}

app.post("/uploadAudio", async function (req, res, next) {
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

      const blobID = (await insertAudioBLob(audio.data)).data.insertId;
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
      message: "Failed to upload.",
      name: audio.name,
    });
  }
});

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

async function insertArtist(artist) {
  const query = `
  INSERT INTO artist(name)
  VALUES("${artist}")
  ;`;

  return await resolveQuery(query);
}

async function getArtistByName(artist) {
  const query = `
  SELECT id 
  FROM artist 
  WHERE name = "${artist}"
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

async function insertAudioBLob(audio) {
  const query = `
  INSERT INTO audio_blob SET ?
  `,
    values = {
      audio: audio,
    };

  return await resolveQuery(query, values);
}

function trimExtension(filename) {
  return filename.replace(/\.[^\/.]+$/, "");
}

app.post("/artistsData", async (req, res, next) => {
  console.log("Body:", req.body);

  const params = {};
  [params.artistID, params.search, params.limit, params.offset] = [
    req.body.artistID,
    req.body.search,
    req.body.limit,
    req.body.offset,
  ];

  const result = await getArtistsData(params),
    artists = result.data || [],
    error = result.error,
    resJSON = {
      status: error || 200,
      artists: [],
    };

  for (const artist of artists) {
    resJSON.artists.push({ ...artist });
  }

  res.send(resJSON);
  res.end();
});

app.post("/imageBlob", async (req, res, next) => {
  const blobID = req.body.blobID,
    audioData = await fetchImageBlob(blobID);

  res.write(audioData.blob);
  res.end();
});

// app.post("/uploadImage", async (req, res, next) => {
//   try {
//     if (!req.files) {
//       res.status(200).send({
//         status: 200,
//         message: "No file uploaded.",
//       });

//       return next();
//     } else {
//       const image = req.files.image;
//       const artistID = req.body.artistID;

//       const blobID = (await insertImageBlob(image.data)).data.insertId;
//       const imageID = (await insertImageData(blobID)).data.insertId;

//       if (artists) {
//         const artistsArr = [artists];

//         for (const [index, artist] of artistsArr.entries()) {
//           var artistID;
//           const getArtistByNameResult = (await getArtistByName(artist))
//             .getArtistByNameResult.data[0];
//           if (getArtistByNameResult) {
//             artistID = getArtistByNameResult.id;
//           } else {
//             artistID = (await insertArtist(artist)).data.insertId;
//           }

//           await insertImageArtist(imageID, artistID, index + 1);
//         }
//       }

//       res.status(200).send({
//         status: 200,
//         message: "File uploaded.",
//         id: imageID,
//         name: name,
//       });
//     }
//   } catch (error) {
//     console.log("Error:", error);

//     res.status(500).send({
//       status: error,
//       message: "Uploading process has failed.",
//       name: audio.name,
//     });

//     return next();
//   }
// });

async function insertImageBlob(image) {
  const query = `
  INSERT INTO image_blob SET ?
  `,
    values = {
      image: image,
    };

  return await resolveQuery(query, values);
}

async function insertImageData(blobID) {
  const query = `
  INSERT INTO image(blob_id) 
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

  if (search) {
    searchQuery = `
    (
      artist.name COLLATE utf8mb4_0900_ai_ci LIKE '%${search}%'
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
  FROM artist
  LEFT JOIN image_artist
  ON artist.id = image_artist.artist_id
  LEFT JOIN image
  ON image.id = image_artist.image_id
  ${queryWhereClause}
  ORDER BY artist.id DESC
  LIMIT ${limit}
  ;`;

  // console.log(query);

  return await resolveQuery(query);
}

async function getArtistBlob(blobID) {
  const query = `
  SELECT artist.name AS artist, image.blob_id AS blob_id
  FROM lush.artist
  LEFT JOIN lush.image_artist
  ON artist.id = image_artist.artist_id
  LEFT JOIN lush.image
  ON image.id = image_artist.image_id
  ;`;

  return await resolveQuery(query);
}

async function fetchImageBlob(blobID) {
  const result = await getImage(blobID),
    audioData = {
      status: result.error || 200,
      blob: result.data[0] ? result.data[0].image : new Uint8Array(0),
    };

  return audioData;
}

async function getImage(blobID) {
  const query = `
  SELECT image
  FROM image_blob
  WHERE id = ${blobID}
  ;`;

  return await resolveQuery(query);
}

app.patch("/editAudio", async function (req, res) {
  console.log("Body:", req.body);

  const params = {},
    audioId = req.body.audioId,
    title = req.body.title,
    artists = req.body.artists;
  params.audioId = audioId;
  params.limit = 1;
  params.offset = 0;
  await editAudio(audioId, title);
  await deleteAudioArtistRelations(audioId);
  artists.forEach(async (artistID, index) => {
    artistID &&
      (await insertAudioArtistRelations(audioId, artistID, index + 1));
  });
  const audioData = await fetchAudioDataById(audioId);

  res.send(audioData);
});

async function editAudio(audioId, title) {
  const query = `
  UPDATE audio
  SET title = "${title}"
  WHERE id = ${audioId}
  ;`;

  return await resolveQuery(query);
}

async function fetchAudioDataById(audioID) {
  const result = await getAudioMetadataById(audioID),
    audiosSpread = result.data.map((audio) => ({ ...audio })) || [],
    audiosGrouped = groupBy(audiosSpread, "audio_id"),
    audiosValues = Object.values(audiosGrouped)[0],
    audiosData = {
      status: result.error || 200,
      audio: audiosValues,
    };

  return audiosData;
}

async function deleteAudioArtistRelations(audioID) {
  const query = `
  DELETE FROM audio_artist
  WHERE audio_id = ${audioID}
  ;`;

  return await resolveQuery(query);
}

async function insertAudioArtistRelations(audioID, artistID, artistPosition) {
  console.log(audioID, artistID);

  const query = `
  INSERT INTO audio_artist(audio_id, artist_id, artist_position) 
  VALUES(${audioID}, ${artistID}, ${artistPosition})
  ;`;

  return await resolveQuery(query);
}

app.post("/submitArtist", async function (req, res) {
  console.log("Body:", req.body);
  console.log("Body:", req.files);

  const artistMetadata = JSON.parse(req.body.artistMetadata);
  var artistID = artistMetadata.artistID;
  const artistName = artistMetadata.artistName;
  const image = req.files?.image;

  console.log(artistMetadata);
  console.log(artistID);
  console.log(artistName);
  console.log(image);

  // if (artistID) {
  //   await editArtist(artistID, artistName);
  // } else {
  //   artistID = (await insertArtist(artistName)).data.insertId;
  // }

  // if (image) {
  //   const blobID = (await insertImageBlob(image.data)).data.insertId;
  //   const imageID = await (await insertImageData(blobID)).data.insertId;
  //   await insertImageArtist(imageID, artistID);
  // }

  res.send({ result: 200 });
});

async function editArtist(artistId, artistName) {
  const query = `
  UPDATE artist
  SET name = "${artistName}"
  WHERE id = ${artistId}
  ;`;

  return await resolveQuery(query);
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

app.delete("/deleteArtist", async function (req, res, next) {
  console.log("Body:", req.body);
  const artistID = req.body.artistID;

  const result = await editArtist(artistID);
  audiosData = {
    status: result.error || 200,
    audios: result.data,
  };

  res.send(audiosData);
});

async function editArtist(artistId) {
  const query = `
  UPDATE artist
  SET deleted = 1
  WHERE id = ${artistId}
  ;`;

  return await resolveQuery(query);
}
