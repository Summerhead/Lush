const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const Readable = require("stream").Readable;

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = "googleapis-conf/token.json";
const CREDENTIALS_PATH = "googleapis-conf/credentials.json";
const FOLDER_IDS_DICT = { artists_images: "1ECBzTjLKWTLWjkipZz53IK_TGgoN3BCh" };

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 */
function authorize(credentials, callback, callbackParams) {
  return new Promise((resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback, callbackParams);
      oAuth2Client.setCredentials(JSON.parse(token));
      await callback(oAuth2Client, ...callbackParams).then((id) => resolve(id));
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, callbackParams) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      return await callback(oAuth2Client, ...callbackParams);
    });
  });
}

/**
 * Describe with given media and metaData and upload it using google.drive.create method()
 */
function uploadFile(auth, folderName, name, file) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    const folderId = FOLDER_IDS_DICT[folderName];
    const fileMetadata = {
      parents: [folderId],
      name: name,
    };
    const readable = new Readable();
    readable._read = () => {}; // _read is required but we can noop it
    readable.push(file.data);
    readable.push(null);
    const media = {
      mimeType: file.mimetype,
      body: readable,
    };

    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) {
          console.error("Error:", err);
          reject(err);
        } else {
          console.log("File uploaded:", name);
          resolve(file.data.id);
        }
      }
    );
  });
}

async function uploadImageToGoogleDrive(...callbackParams) {
  return new Promise((resolve, reject) => {
    fs.readFile(CREDENTIALS_PATH, async (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Drive API.
      await authorize(JSON.parse(content), uploadFile, callbackParams).then(
        (id) => resolve(id)
      );
    });
  });
}

async function uploadImagesToGoogleDrive(auth) {
  for (let i = 1; i < 1535; i++) {
    console.log(i);
    const result = await fetchImageBlobGoogleDrive(i);
    const { name: artistName, id: artistId } = (await findArtist(i)).artist;
    const uploadedImageId = await uploadFile(
      auth,
      folderId,
      artistName,
      result.blob
    );
    const imageId = (await insertArtistImageDataGoogleDrive(uploadedImageId))
      .data.insertId;
    await insertImageArtistGoogleDrive(imageId, artistId);
  }
}

async function fetchImageBlobGoogleDrive(blobId) {
  const result = await getArtistImageBlobGoogleDrive(blobId);
  const status = result.error || 200;
  const blob = result.data[0]?.image || new Uint8Array(0);
  const imageBlobData = {
    status: status,
    blob: blob,
  };

  return imageBlobData;
}

async function getArtistImageBlobGoogleDrive(blobId) {
  const query = `
  SELECT image
  FROM artistimage_blob
  WHERE id = ${blobId}
  ;`;

  return await resolveQuery(query);
}

async function findArtist(blobId) {
  const result = await getArtistName(blobId);
  const status = result.error || 200;
  var artist = result.data?.map((artist) => ({ ...artist }))[0] || [];
  const artistData = {
    status: status,
    artist: artist,
  };

  return artistData;
}

async function getArtistName(blobId) {
  const query = `
  SELECT artist.id, artist.name
  FROM artistimage_blob, artistimage, image_artist, artist
  WHERE artistimage_blob.id = ${blobId} 
  AND artistimage_blob.id = artistimage.blob_id
  AND artistimage.id = image_artist.image_id
  AND image_artist.artist_id = artist.id
  ;`;

  return await resolveQuery(query);
}

module.exports = { uploadImageToGoogleDrive };
