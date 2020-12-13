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

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/main.html"));
});

app.get("/music", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/music.html"));
});

app.get("/artists", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/artists.html"));
});

app.get("/artists/:artist_id", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/artist.html"));
});

app.get("/header", async function (req, res, next) {
  const result = await getHeaderInfo(),
    artists = result.data || [],
    error = result.error,
    resJSON = {
      status: error || "success",
      results: { artists: [] },
    };

  for (const artist of artists) {
    resJSON.results.artists.push({ ...artist });
  }

  res.send(resJSON);
  res.end();
});

async function getHeaderInfo() {
  const query = `
  SELECT name AS artist
  FROM artist
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

  const artistID = Number(req.body.artistID);

  const params = {};
  [params.artistID, params.limit, params.offset] = [
    artistID,
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

async function fetchAudioData(params) {
  const result = await getAudioMetadata(params),
    error = result.error,
    audios = result.data || [],
    audioData = {
      status: error || 200,
      audios: [],
    };

  for (const audio of audios) {
    const result = await getArtistsByAudioID(audio.id),
      artists = result.data;

    audio.artists = [];

    for (const artist of artists) {
      audio.artists.push({ id: artist.id, name: artist.name });
    }

    audioData.audios.push({ ...audio });
  }

  return audioData;
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

async function getAudioMetadata({ artistID, limit, offset }) {
  var artistIDJoinClause = "",
    artistIDWhereClause = "",
    artistIDJoinSubquery = "",
    artistIDWhereSubquery = "";
  if (artistID) {
    artistIDJoinClause = `
    LEFT JOIN audio_artist 
    ON audio.id = audio_artist.audio_id
    LEFT JOIN artist 
    ON audio_artist.artist_id = artist.id
    `;

    artistIDWhereClause = `
    AND artist.id = ${artistID}
    `;

    artistIDJoinSubquery = `
    LEFT JOIN audio_artist 
    ON audio.id = audio_artist.audio_id
    LEFT JOIN artist 
    ON audio_artist.artist_id = artist.id
    `;

    artistIDWhereSubquery = `
    WHERE artist.id = ${artistID}
    `;
  }

  const query = `
  SELECT audio.id, blob_id, title, duration
  FROM audio
  ${artistIDJoinClause}
  WHERE audio.id <= 
      (
        SELECT audio.id 
        FROM audio 
        ${artistIDJoinSubquery}
        ${artistIDWhereSubquery}
        ORDER BY audio.id DESC
        LIMIT 1 OFFSET ${offset}
      )
  ${artistIDWhereClause}
  ORDER BY audio.id DESC
  LIMIT ${limit}
  ;`;

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

      const separator = " - ";
      const separatorIndex = name.indexOf(separator);

      if (separatorIndex != -1) {
        var artists = name.substr(0, separatorIndex);
        title = name.substr(separatorIndex + separator.length);
      }

      const blobID = (await insertAudioBLob(audio.data)).data.insertId;
      const audioID = (await insertAudioData(blobID, title)).data.insertId;
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

async function insertAudioData(blobID, title) {
  const query = `
  INSERT INTO audio(blob_id, title) 
  VALUES("${blobID}", "${title}")
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
  const artistID = Number(req.body.artistID);
  console.log(req.body);
  console.log(artistID);

  const params = {};
  [params.artistID, params.limit, params.offset] = [
    artistID,
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

app.post("/uploadImage", async (req, res, next) => {
  try {
    if (!req.files) {
      res.status(200).send({
        status: 200,
        message: "No file uploaded.",
      });

      return next();
    } else {
      const image = req.files.image;
      const name = trimExtension(image.name);
      const artists = name;

      const blobID = (await insertImageBLob(image.data)).data.insertId;
      const audioID = (await insertImageData(blobID)).data.insertId;

      if (artists) {
        const artistsArr = [artists];

        for (const [index, artist] of artistsArr.entries()) {
          var artistID;
          const getArtistByNameResult = (await getArtistByName(artist))
            .getArtistByNameResult.data[0];
          if (getArtistByNameResult) {
            artistID = getArtistByNameResult.id;
          } else {
            artistID = (await insertArtist(artist)).data.insertId;
          }

          await insertImageArtist(audioID, artistID, index + 1);
        }
      }

      res.status(200).send({
        status: 200,
        message: "File uploaded.",
        id: audioID,
        name: name,
      });
    }
  } catch (error) {
    console.log("Error:", error);

    res.status(500).send({
      status: error,
      message: "Uploading process has failed.",
      name: audio.name,
    });
  }
});

async function insertImageBLob(image) {
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

async function getArtistsData({ artistID, limit, offset }) {
  var artistIDJoinClause = "",
    artistIDWhereClause = "",
    artistIDJoinSubquery = "",
    artistIDWhereSubquery = "";
  console.log(artistID);
  if (artistID) {
    artistIDWhereClause = `
  AND artist.id = ${artistID}
  `;

    artistIDJoinSubquery = `
  LEFT JOIN audio_artist 
  ON audio.id = audio_artist.audio_id
  LEFT JOIN artist 
  ON audio_artist.artist_id = artist.id
  `;

    artistIDWhereSubquery = `
  WHERE artist.id = ${artistID}
  `;
  }

  const query = `
  SELECT artist.id AS artist_id, artist.name AS name, 
  image.blob_id AS blob_id
  FROM artist
  LEFT JOIN image_artist
  ON artist.id = image_artist.artist_id
  LEFT JOIN image
  ON image.id = image_artist.image_id
  ${artistIDJoinClause}
  WHERE artist.id <= 
    (
      SELECT artist.id 
      FROM artist 
      LEFT JOIN image_artist
      ON artist.id = image_artist.artist_id
      LEFT JOIN image
      ON image.id = image_artist.image_id
      ${artistIDWhereSubquery}
      ORDER BY artist.id DESC
      LIMIT 1 OFFSET ${offset}
    )
  ${artistIDWhereClause}
  ORDER BY artist.id DESC
  LIMIT ${limit}
  ;`;

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
