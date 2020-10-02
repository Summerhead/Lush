const mysql2 = require("mysql2");
const express = require("express");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const connection = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "beautyofbalance",
    database: "lush",
});

app.listen("5501");

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

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

let queryError,
    queryResults = [],
    audios = [],
    query,
    rowsCount,
    rowsLimit,
    offset,
    call;

app.post("/", async function (req, res, next) {
    await getNumOfRowsFromDatabase();
    var rowsCount = queryResults[0]["COUNT(*)"];

    var rowsLimit = req.body.rowLimit;
    var offset = req.body.offset;
    var call = req.body.call;
    console.log("req.body:", req.body);

    await getAudiosFromDatabase(rowsLimit, offset);
    var audios = queryResults;

    console.log("audios:", audios);

    var str;
    if (call) {
        res.write(`{"status":` + (queryError || `"success"`) + `,"audios":[`);
    }
    for (let i = 0; i < audios.length; i++) {
        if (call) {
            await getArtistsFromDatabase(audios[i]["id"]);
            audios[i]["artists"] = [];

            queryResults.forEach((element) => {
                audios[i]["artists"].push(element["artist__name"]);
            });

            delete audios[i]["audio"];

            res.write(JSON.stringify({ ...audios[i] }));
            if (i + 1 != audios.length) res.write(",");
        } else {
            res.write(audios[i]["audio"]);
        }
    }
    if (call) {
        res.write("]}");
    }

    res.end();
});

async function getNumOfRowsFromDatabase() {
    var query = `
    SELECT COUNT(*) FROM audio;
    `;
    await resolveQuery(query);
    // console.log(queryResults[0]['COUNT(*)']);
}

async function getAudiosFromDatabase(start, offset) {
    // query = `
    // SELECT audio__id AS id, audio__title AS title, artist__name AS artist
    // FROM audio
    //     LEFT JOIN audio_artist
    //     ON audio__id = audio_artist__audio__id
    //     LEFT JOIN artist
    //     ON artist__id = audio_artist__artist__id
    // WHERE audio__id >= ${start}
    // LIMIT ${end};
    // `;

    var query = `
    SELECT audio__id AS id, audio__audio AS audio, audio__title AS title
    FROM audio 
    ORDER BY id DESC
    LIMIT ${start} OFFSET ${offset}
    `;
    await resolveQuery(query);
    // console.log(queryResults);
}

async function getArtistsFromDatabase(audioID) {
    var query = `
    SELECT artist__name 
    FROM artist
        LEFT JOIN audio_artist 
        ON artist__id = audio_artist__artist__id
        LEFT JOIN audio
        ON audio__id = audio_artist__audio__id
    WHERE audio__id = ${audioID};
    `;
    await resolveQuery(query);
    // console.log(queryResults);
}

async function resolveQuery(query) {
    try {
        await Promise.resolve(executeQuery(query));
    } catch (error) {
        console.log("error:", error);
        queryError = error;
    }
}

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, function (error, results) {
            queryError = error;
            resolve(results);
            reject(results);
        });
    }).then((results) => {
        queryResults = results;
    });
}

app.get("/header", async function (req, res, next) {
    await getHeaderInfo();
    var artists = queryResults;

    res.write(
        `{"status":` + (queryError || `"success"`) + `,"results":{"artists":[`
    );
    for (let i = 0; i < artists.length; i++) {
        res.write(JSON.stringify({ ...artists[i] }));
        // console.log(JSON.stringify({ ...artists[i] }));
        if (i + 1 != artists.length) res.write(",");
    }
    res.write("]}}");

    res.end();
});

async function getHeaderInfo() {
    var query = `
    SELECT artist__name AS artist
    FROM artist
    `;
    await resolveQuery(query);
}
