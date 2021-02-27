const express = require("express");
const router = express.Router();
const { resolveQuery } = require("../general.js");

router.get("/genresData", async function (req, res, next) {
  console.log("Body:", req.body);

  const result = await getGenres(),
    status = result.error || 200,
    genresData = {
      status: status,
      genres: result.data,
    };

  res.send(genresData);
});

async function getGenres() {
  const query = `
  SELECT genre.id, genre.name, count(audio.id) AS audios_count
  FROM genre
  LEFT JOIN audio_genre 
  ON genre.id = audio_genre.genre_id
  LEFT JOIN audio
  ON audio.id = audio_genre.audio_id
  GROUP BY genre.id
  ORDER BY genre.name
  ;`;

  return await resolveQuery(query);
}

module.exports = router;
