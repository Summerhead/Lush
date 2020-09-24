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
    iteration;
app.post("/", async function (req, res, next) {
    await getNumOfRowsFromDatabase();
    rowsCount = queryResults[0]["COUNT(*)"];
    rowsLimit = req.body["rowLimit"];
    iteration = req.body["iteration"];
    console.log("req.body:", req.body);

    await getAudiosFromDatabase(rowsLimit, iteration);
    audios = queryResults;

    res.write(`{"status":` + (queryError || `"success"`) + `,"results":[`);
    for (let i = 0; i < audios.length; i++) {
        await getArtistsFromDatabase(audios[i]["id"]);
        audios[i]["artists"] = [];

        queryResults.forEach((element) => {
            audios[i]["artists"].push(element["artist__name"]);
        });

        res.write(
            JSON.stringify({
                ...audios[i],
            })
        );
        if (i + 1 != audios.length) res.write(",");
    }
    res.write("]}");

    res.end();
});

async function getNumOfRowsFromDatabase() {
    query = `
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

    query = `
    SELECT audio__id AS id, audio__audio AS audio, audio__title AS title
    FROM audio 
    ORDER BY id DESC
    LIMIT ${start} OFFSET ${offset};
    `;
    await resolveQuery(query);
    // console.log(queryResults);
}

async function getArtistsFromDatabase(audioID) {
    query = `
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
