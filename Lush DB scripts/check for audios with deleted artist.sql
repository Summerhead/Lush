SELECT audio.id, audio.title, artist.id, artist.name
FROM audio 
left join audio_artist
on audio.id = audio_artist.audio_id
left join artist
on artist.id = audio_artist.artist_id
WHERE artist.deleted = 1