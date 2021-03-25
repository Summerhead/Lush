const { connection } = require("./server.js");

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

const audiosGroupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    rv.get(x[key]) || rv.set(x[key], { artists: {}, genres: {} });
    rv.get(x[key]).audio_id = x.audio_id;
    rv.get(x[key]).blob_id = x.blob_id;
    rv.get(x[key]).title = x.title;
    rv.get(x[key]).fullAudioTitle = x.fullAudioTitle;
    rv.get(x[key]).duration = x.duration;
    rv.get(x[key]).artists[x.artist_id] = {
      artist_id: x.artist_id,
      name: x.name,
      position: x.artist_position,
    };
    if (x.genre_id) {
      rv.get(x[key]).genres[x.genre_id] = {
        genre_id: x.genre_id,
        genre_name: x.genre_name,
        position: x.genre_position,
      };
    }
    return rv;
  }, new Map());
};

const artistsGroupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    rv.get(x[key]) || rv.set(x[key], { genres: {} });
    rv.get(x[key]).artist_id = x.artist_id;
    rv.get(x[key]).artist_name = x.artist_name;
    rv.get(x[key]).artistimage_blob_id = x.artistimage_blob_id;
    if (x.genre_id) {
      rv.get(x[key]).genres[x.genre_id] = {
        genre_id: x.genre_id,
        genre_name: x.genre_name,
        genre_position: x.genre_position,
      };
    }
    return rv;
  }, new Map());
};

async function insertArtist(artistName) {
  const query = `
  INSERT INTO artist(name)
  VALUES("${artistName}")
  ;`;

  return await resolveQuery(query);
}

function constructWhereClauseAnd(whereClauses) {
  return whereClauses.length ? "WHERE " + [...whereClauses].join(" AND ") : "";
}

function constructWhereClauseOr(whereClauses) {
  return whereClauses.length ? "(" + [...whereClauses].join(" OR ") + ")" : "";
}

function trimExtension(filename) {
  return filename.replace(/\.[^\/.]+$/, "");
}

module.exports = {
  resolveQuery,
  audiosGroupBy,
  artistsGroupBy,
  insertArtist,
  constructWhereClauseAnd,
  constructWhereClauseOr,
  trimExtension,
};
