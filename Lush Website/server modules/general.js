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

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    rv.get(x[key]) || rv.set(x[key], { artists: {}, genres: {} });
    rv.get(x[key]).audio_id = x.audio_id;
    rv.get(x[key]).blob_id = x.blob_id;
    rv.get(x[key]).title = x.title;
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

function constructWhereClause(whereClauses) {
  return whereClauses.length ? "WHERE " + [...whereClauses].join(" AND ") : "";
}

function trimExtension(filename) {
  return filename.replace(/\.[^\/.]+$/, "");
}

module.exports = {
  resolveQuery,
  groupBy,
  insertArtist,
  constructWhereClause,
  trimExtension,
};
