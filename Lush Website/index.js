const mysql2 = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const fileUpload = require("express-fileupload");

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const connection = mysql2.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "beautyofbalance",
  database: "lush",
});

// connection.execute(
//   "SET GLOBAL general_log = 'OFF';",
//   (error, results, fields) => {
//     console.log("Error:", error);
//     console.log("Results:", results);
//     console.log("Fields:", fields);
//   }
// );

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
  var query = `
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

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.post("/audioData", async function (req, res, next) {
  // console.log("Body:", req.body);

  const limit = req.body.limit,
    offset = req.body.offset,
    audioData = await fetchAudioData(limit, offset);

  res.send(audioData);
});

app.post("/audioBlob", async function (req, res, next) {
  // console.log("Body:", req.body);

  const blobID = req.body.blobID,
    audioData = await fetchAudioBlob(blobID);

  res.write(audioData.blob);
  res.end();
});

async function fetchAudioData(limit, offset) {
  const result = await getAudioMetadata(limit, offset),
    error = result.error,
    audios = result.data || [],
    audioData = {
      status: error || 200,
      audios: [],
    };

  for (const audio of audios) {
    const result = await getArtists(audio.id),
      artists = result.data;

    audio.artists = [];

    for (const artist of artists) {
      audio.artists.push(artist.name);
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

async function getAudioMetadata(limit, offset) {
  console.log("limit, offset:", limit, offset);
  const query = `
    SELECT id, blob_id, title
    FROM audio
    WHERE id <= 
        (
          SELECT id FROM audio 
          ORDER BY id DESC
          LIMIT 1 OFFSET ${offset - 1}
        )
    ORDER BY id DESC
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

async function getArtists(audioID) {
  const query = `
    SELECT name 
    FROM artist
        LEFT JOIN audio_artist 
        ON artist.id = artist_id
        LEFT JOIN audio
        ON audio.id = audio_id
    WHERE audio.id = ${audioID}
    ;`;

  return await resolveQuery(query);
}

app.post("/upload", async function (req, res, next) {
  try {
    if (!req.files) {
      res.send({
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
      var artists;

      if (separatorIndex != -1) {
        artists = name.substr(0, separatorIndex);
        title = name.substr(separatorIndex + separator.length);
      }

      const blobID = (await insertAudioBLob(audio.data)).data.insertId;
      const audioID = (await insertAudioData(blobID, title)).data.insertId;
      await insertAudioLanguage(audioID, 1);

      if (artists) {
        const audioArtistSeparator = /, | & | [fF]?eat[.]*? /;
        const artistsArr = parseArtists(artists, audioArtistSeparator);

        for (const [index, artist] of artistsArr.entries()) {
          var artistID;
          try {
            artistID = (await getArtistByName(artist)).data[0].id;
          } catch {
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

    res.send({
      status: error,
      message: "Uploading process has failed.",
      name: audio.name,
    });
  }
});

function parseArtists(artists, separator) {
  artists = artists.split(separator);
  return artists;
}

// app.post("/upload", async function (req, res, next) {
//   try {
//     // await truncateDatabase();
//     req.body.info = JSON.parse(req.body.info);
//     console.log("Body:", req.body.info);
//     console.log("Audio:", req.files);

//     if (!req.files) {
//       res.send({
//         status: false,
//         message: "No file uploaded",
//       });

//       return next();
//     } else {
//       const audio = req.files.audio,
//         name = req.body.info.input,
//         processed = req.body.info.processed;

//       const filename = trimExtension(name),
//         audioFilenameResult = await getFilename(filename);
//       audioFilenameResult.data = { ...audioFilenameResult.data[0] };
//       var title = filename;

//       // console.log("filename: ", filename);
//       // console.log("audioFilenameResult: ", audioFilenameResult);

//       if (
//         audioFilenameResult.error === undefined &&
//         Object.keys(audioFilenameResult.data).length
//       ) {
//         const data = audioFilenameResult.data;
//         var audioTitle = data.renamed_title,
//           artistsInFilenameID = data.artist_in_filename_id;
//         // console.log("Result: ", audioTitle, artistInFilenameID);

//         // const insertAudioResult = await insertAudio(audio.data, audioTitle);
//         const insertAudioResult = await insertAudioData(audioTitle),
//           insertedAudioID = insertAudioResult.data.insertId,
//           artistRoleID = insertAudioResult.data.artist_role_id,
//           artistPosition = insertAudioResult.data.artist_position;
//         await insertAudioBLob(insertedAudioID, data);
//         console.log("insertAudioResult:", insertAudioResult);

//         const artistsInFilenameArtistResult = await getArtistsInFilenameArtist(
//           artistsInFilenameID
//         );
//         // console.log("insertedAudioID:", insertedAudioID);
//         // console.log("artistsInFilenamesResult:", artistsInFilenamesResult);

//         // const artistIDs = [];
//         // artistsInFilenamesResult.data.forEach((row) => {
//         //   artistIDs.push(row.artist_in_filename_artist__artist__id);
//         // });
//         // console.log("artistIDs:", artistIDs);

//         artistsInFilenameArtistResult.data.forEach(async (artistID) => {
//           await insertAudioArtist(
//             insertedAudioID,
//             artistID,
//             artistRoleID,
//             artistPosition
//           );
//         });
//       } else {
//         const separator = " - ";
//         const separatorFirstOccur = filename.indexOf(separator);
//         var artists;

//         if (separatorFirstOccur != -1) {
//           artists = filename.substr(0, separatorFirstOccur);
//           title = filename.substr(separatorFirstOccur + separator.length);
//         } else {
//           artists = null;
//           title = filename;
//         }

//         if (artists == "Unknown Artist") {
//           artists = filename;
//         }

//         const artistsInFilenameResult = await getArtistsInFilename(artists);
//         artistsInFilenameResult.data = {
//           ...artistsInFilenameResult.data[0],
//         };
//         artistsInFilenameID = artistsInFilenameResult.data.id;
//         console.log("artistInFilenameResult:", artistsInFilenameResult);
//         // console.log(
//         //   "artistInFilenameResult.data:",
//         //   artistInFilenameResult.data
//         // );

//         const filePattern = /~|_|&|u0|\+|\[|\]|{|}|\(|\)| [fF]?eat[.]*? /;

//         if (
//           artistsInFilenameResult.error === undefined &&
//           artistsInFilenameID
//         ) {
//           if (
//             ((filename.match(separator) || []).length != 1 ||
//               filePattern.test(filename)) &&
//             !processed
//           ) {
//             res.send({
//               status: true,
//               message: "Set the audio name",
//               data: {
//                 name: audio.name,
//                 mimetype: audio.mimetype,
//                 size: audio.size,
//               },
//             });

//             return next();
//           }
//           const insertAudioResult = await insertAudioData(title),
//             insertedAudioID = insertAudioResult.data.insertId,
//             artistRoleID = insertAudioResult.data.artist_role_id,
//             artistPosition = insertAudioResult.data.artist_position;
//           await insertAudioBLob(insertedAudioID, audio.data);
//           // console.log("insertAudioResult:", insertAudioResult);

//           const artistsInFilenameArtistResult = await getArtistsInFilenameArtist(
//             artistsInFilenameID
//           );

//           artistsInFilenameArtistResult.data.forEach(async (artistID) => {
//             console.log("artistID:", artistID);
//             await insertAudioArtist(insertedAudioID, artistID);
//           });
//         } else {
//           if (
//             ((filename.match(separator) || []).length != 1 ||
//               filePattern.test(filename)) &&
//             !processed
//           ) {
//             const insertedArtistsInFilenameResult = await insertArtistsInFilename(
//               artists
//             );
//             console.log(
//               "insertedArtistsInFilenameResult:",
//               insertedArtistsInFilenameResult
//             );
//             artistsInFilenameID = insertedArtistsInFilenameResult.data.insertId;

//             res.send({
//               status: false,
//               message: "Set the audio name",
//               data: {
//                 name: audio.name,
//                 mimetype: audio.mimetype,
//                 size: audio.size,
//               },
//             });

//             return next();
//           }

//           const insertAudioResult = await insertAudioData(title),
//             insertedAudioID = insertAudioResult.data.insertId,
//             artistRoleID = insertAudioResult.data.artist_role_id,
//             artistPosition = insertAudioResult.data.artist_position;
//           await insertAudioBLob(insertedAudioID, audio.data);
//           // console.log("insertedAudioResult:", insertedAudioResult);

//           const audioArtistSeparator = " & ";
//           const artistsArr = parseArtists(artists, audioArtistSeparator);
//           console.log("artistsArr:", artistsArr);

//           artistsArr.forEach(async (artist) => {
//             const selectedArtistResult = await getArtistByName(artist);
//             // console.log("selectedArtistResult:", selectedArtistResult);

//             const selectedArtistID = selectedArtistResult.data[0];

//             var insertedArtistID;
//             if (selectedArtistID) {
//               insertedArtistID = selectedArtistID;
//             } else {
//               insertedArtistID = (await insertArtist(artist)).data.insertId;
//             }

//             // console.log("Watch:", insertedAudioID, insertedArtistID);
//             await insertAudioArtist(insertedAudioID, insertedArtistID);
//             await insertArtistsInFilenameArtist(
//               artistsInFilenameID,
//               insertedArtistID
//             );
//           });
//         }

//         await insertAudioFilename(filename, title, artistsInFilenameID);
//       }

//       res.send({
//         status: true,
//         message: "File is uploaded",
//         data: {
//           name: audio.name,
//           mimetype: audio.mimetype,
//           size: audio.size,
//         },
//       });

//       return next();
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).send(error);
//   }
// });

// function parseArtists(artists, separator) {
//   artists = artists.split(separator);

//   artists.forEach((artist) => {
//     const matches = artist.match(/ (?:&&) /);

//     if (matches) {
//       matches.forEach((m) => {
//         const match = m.match(/(?:&&)/).input;
//         const newMatch = m.replace(match, match.substring(0, match.length - 1));

//         artist = artist.replace(m, newMatch);
//       });
//     }
//   });

//   return artists;
// }

async function insertAudioLanguage(audioID, languageID) {
  const query = `
    INSERT INTO audio_language(audio_id, language_id) 
    VALUES(${audioID}, ${languageID})
  ;`;

  return await resolveQuery(query);
}

async function insertAudioFilename(
  audioFilename,
  renamedTitle,
  artistInFilenameID
) {
  const query = `
    INSERT INTO filename(filename, renamed_title, artists_in_filename_id) 
    VALUES("${audioFilename}", "${renamedTitle}", ${artistInFilenameID})
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

async function insertArtistsInFilenameArtist(artistsInFilenameID, artistID) {
  const query = `
  INSERT INTO artists_in_filename_artist(artists_in_filename_id, artist_id) 
  VALUES(${artistsInFilenameID}, ${artistID})
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

async function insertArtistsInFilename(artists) {
  const query = `
    INSERT INTO artists_in_filename(artists)
    VALUES("${artists}")
  ;`;

  return await resolveQuery(query);
}

async function truncateDatabase() {
  const query = `
  TRUNCATE TABLE lush.artist;
  TRUNCATE TABLE lush.artist_in_filename;
  TRUNCATE TABLE lush.artist_in_filename_artist;
  TRUNCATE TABLE lush.audio;
  TRUNCATE TABLE lush.audio_artist;
  TRUNCATE TABLE lush.audio_filename;
  TRUNCATE TABLE lush.image;
  TRUNCATE TABLE lush.image_artist;
  TRUNCATE TABLE lush.post;
  TRUNCATE TABLE lush.post_audio;
  TRUNCATE TABLE lush.post_image;
  TRUNCATE TABLE lush.post_tag;
  TRUNCATE TABLE lush.tag;
  `;

  return await resolveQuery(query);
}

async function getArtistsInFilename(artists) {
  const query = `
    SELECT id
    FROM artists_in_filename 
    WHERE artists = "${artists}"
    ;`;

  return await resolveQuery(query);
}

async function getArtistsInFilenameArtist(id) {
  const query = `
    SELECT * FROM artists_in_filename_artist 
    WHERE artists_in_filename_id = ${id}
    ;`;

  return await resolveQuery(query);
}

// async function insertAudio(audio, title) {
//   await insertAudioData(title);
//   await insertAudioBLob(audio);
// }

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

async function getFilename(filename) {
  const query = `
    SELECT *
    FROM filename 
    WHERE filename = "${filename}"
    ;`;

  return await resolveQuery(query);
}
