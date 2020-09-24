using MySql.Data.MySqlClient;
using Org.BouncyCastle.Utilities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace LoadDataToMySQL {

    class MySqlDbUtils {
        public static MySqlConnection connection;
        public static MySqlCommand command;
        public static int artistInFilenameIdIndex;
        public static int renamedTitleIndex;
        public static object result;
        private static int columnIndex;

        public const string insertArtistCommandString = "INSERT INTO artist(artist__name) VALUES(@Name)";
        public const string insertImageCommandString = "INSERT INTO image(image__image) VALUES(@Image)";
        public const string insertImageArtistCommandString = "INSERT INTO image_artist(image_artist__image__id, image_artist__artist__id) VALUES(@ImageID, @ArtistID)";

        public const string insertAudioCommandString = "INSERT INTO audio(audio__audio, audio__title) VALUES(@Audio, @Title)";
        public const string insertAudioArtistCommandString = "INSERT INTO audio_artist(audio_artist__audio__id, audio_artist__artist__id) VALUES(@AudioID, @ArtistID)";

        public const string insertArtistInFilenameCommandString = "INSERT INTO artist_in_filename(artist_in_filename__name) VALUES(@ArtistInFilename)";
        public const string insertArtistInFilenameArtistCommandString = "INSERT INTO artist_in_filename_artist(" +
            "artist_in_filename_artist__artist_in_filename__id, artist_in_filename_artist__artist__id) VALUES(@ArtistInFilenameID, @ArtistID)";

        public const string selectArtistInFilenameCommandString = "SELECT artist_in_filename__id FROM artist_in_filename WHERE artist_in_filename__name = @ArtistInFilename";
        public const string selectArtistInFilenameArtistCommandString = "SELECT * FROM artist_in_filename_artist WHERE " +
            "artist_in_filename_artist__artist_in_filename__id = @ArtistInFilenameID";

        public const string selectAudioFilenameCommandString = "SELECT * FROM audio_filename WHERE audio_filename__name = @AudioFilename";
        private static string insertArtistFilenameCommandString = "INSERT INTO audio_filename(" +
            "audio_filename__name, audio_filename__renamed_title, audio_filename__artist_in_filename__id) VALUES(@AudioFilename, @RenamedTitle, @ArtistInFilenameID)";

        private static string selectArtistByNameCommandString = "SELECT artist__id FROM artist WHERE artist__name = @Artist";
        private static string selectArtistsIDsCommandString = "SELECT artist__id FROM artist";

        private static string insertPostCommandString = "INSERT INTO post() VALUES()";
        private static string selectImageArtistImageIDsCommandString = "SELECT image_artist__image__id FROM image_artist WHERE image_artist__artist__id = @ArtistID";
        private static string selectAudioArtistAudioIDsCommandString = "SELECT audio_artist__audio__id FROM audio_artist WHERE audio_artist__artist__id = @ArtistID";

        private static string insertPostImageCommandString = "INSERT INTO post_image(post_image__post__id, post_image__image__id) VALUES(@PostID, @ImageID)";
        private static string insertPostAudioCommandString = "INSERT INTO post_audio(post_audio__post__id, post_audio__audio__id) VALUES(@PostID, @AudioID)";

        public static MySqlConnection GetDBConnection() {
            string host = "127.0.0.1";
            int port = 3306;
            string database = "lush";
            string username = "root";
            string password = "beautyofbalance";

            return SetDBConnection(host, port, database, username, password);
        }

        public static MySqlConnection SetDBConnection(string host, int port, string database, string username, string password) {
            string connectionString = $"Server={host};Database={database};" +
                $"port={port};User Id={username};password={password}";

            connection = new MySqlConnection(connectionString);

            return connection;
        }

        internal static long InsertArtistDataInDatabase(string artist) {
            try {
                command = new MySqlCommand(insertArtistCommandString, connection);
                command.Parameters.Add("@Name", MySqlDbType.VarChar);

                command.Parameters["@Name"].Value = artist;

                command.ExecuteNonQuery();

                Console.WriteLine("command.LastInsertedId: " + command.LastInsertedId);
                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertArtistDataInDatabase: " + ex.Message);
                return -1;
            }
        }

        internal static long InsertImageDataInDatabase() {
            try {
                command = new MySqlCommand(insertImageCommandString, connection);
                command.Parameters.Add("@Image", MySqlDbType.Blob);

                command.Parameters["@Image"].Value = ImagesProcessWindowForm.file;

                command.ExecuteNonQuery();

                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertImageDataInDatabase: " + ex.Message);
                return -1;
            }
        }

        internal static void InsertImageArtistDataInDatabase(long imageID, long artistID) {
            try {
                command = new MySqlCommand(insertImageArtistCommandString, connection);
                command.Parameters.Add("@ImageID", MySqlDbType.Int64);
                command.Parameters.Add("@ArtistID", MySqlDbType.Int64);

                command.Parameters["@ImageID"].Value = imageID;
                command.Parameters["@ArtistID"].Value = artistID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertImageArtistDataInDatabase: " + ex.Message);
            }
        }

        internal static long InsertAudioDataInDatabase() {
            try {
                command = new MySqlCommand(insertAudioCommandString, connection);
                command.Parameters.Add("@Audio", MySqlDbType.Blob);
                command.Parameters.Add("@Title", MySqlDbType.VarChar);

                command.Parameters["@Audio"].Value = ImagesProcessWindowForm.file;
                command.Parameters["@Title"].Value = ImagesProcessWindowForm.audioTitle;

                command.ExecuteNonQuery();

                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertAudioDataInDatabase: " + ex.Message);
                return -1;
            }
        }

        internal static void InsertAudioArtistDataInDatabase(long audioID, long artistID) {
            try {
                command = new MySqlCommand(insertAudioArtistCommandString, connection);
                command.Parameters.Add("@AudioID", MySqlDbType.Int64);
                command.Parameters.Add("@ArtistID", MySqlDbType.Int64);

                command.Parameters["@AudioID"].Value = audioID;
                command.Parameters["@ArtistID"].Value = artistID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertAudioArtistDataInDatabase: " + ex.Message);
            }
        }

        internal static long InsertArtistInFilenameInDatabase(string filename) {
            try {
                command = new MySqlCommand(insertArtistInFilenameCommandString, connection);
                command.Parameters.Add("@ArtistInFilename", MySqlDbType.VarChar);

                command.Parameters["@ArtistInFilename"].Value = filename;

                command.ExecuteNonQuery();

                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertArtistInFilenameInDatabase: " + ex.Message);
                return -1;
            }
        }

        internal static void InsertArtistInFilenameArtistInDatabase(long artistInFilenameID, long artistID) {
            try {
                command = new MySqlCommand(insertArtistInFilenameArtistCommandString, connection);
                command.Parameters.Add("@ArtistInFilenameID", MySqlDbType.Int64);
                command.Parameters.Add("@ArtistID", MySqlDbType.Int64);

                command.Parameters["@ArtistInFilenameID"].Value = artistInFilenameID;
                command.Parameters["@ArtistID"].Value = artistID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertArtistInFilenameArtistInDatabase: " + ex.Message);
            }
        }

        internal static void GetArtistsInFilenamesFromDatabase(long artistInFilenameID) {
            try {
                command = new MySqlCommand(selectArtistInFilenameArtistCommandString, connection);
                command.Parameters.Add("@ArtistInFilenameID", MySqlDbType.VarChar);

                command.Parameters["@ArtistInFilenameID"].Value = artistInFilenameID;

                using (DbDataReader reader = command.ExecuteReader()) {
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            artistInFilenameIdIndex = reader.GetOrdinal("artist_in_filename_artist__artist__id");
                            ImagesProcessWindowForm.selectedArtistsIDs.Add(Convert.ToInt64(reader.GetValue(artistInFilenameIdIndex)));
                        }
                    }
                }
            }
            catch (Exception ex) {
                MessageBox.Show("GetArtistsInFilenamesFromDatabase: " + ex.Message);
            }
        }

        internal static object GetArtistInFilenameFromDatabase(string artistInFilename) {
            try {
                command = new MySqlCommand(selectArtistInFilenameCommandString, connection);
                command.Parameters.Add("@ArtistInFilename", MySqlDbType.VarChar);

                command.Parameters["@ArtistInFilename"].Value = artistInFilename;

                return command.ExecuteScalar();
            }
            catch (Exception ex) {
                MessageBox.Show("GetArtistInFilenameFromDatabase: " + ex.Message);
                return null;
            }
        }

        internal static object GetAudioFilenameFromDatabase(string audioFilename) {
            try {
                command = new MySqlCommand(selectAudioFilenameCommandString, connection);
                command.Parameters.Add("@AudioFilename", MySqlDbType.VarChar);

                command.Parameters["@AudioFilename"].Value = audioFilename;

                using (DbDataReader reader = command.ExecuteReader()) {
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            renamedTitleIndex = reader.GetOrdinal("audio_filename__renamed_title");
                            ImagesProcessWindowForm.audioTitle = reader.GetValue(renamedTitleIndex).ToString();

                            renamedTitleIndex = reader.GetOrdinal("audio_filename__artist_in_filename__id");
                            return reader.GetValue(renamedTitleIndex).ToString();
                        }
                    }
                }

                return null;
            }
            catch (Exception ex) {
                MessageBox.Show("GetAudioFilenameFromDatabase: " + ex.Message);
                return null;
            }
        }

        internal static void InsertAudioFilenameInDatabase(string artistsTitle, string audioTitle, object artistInFilenameID) {
            try {
                command = new MySqlCommand(insertArtistFilenameCommandString, connection);
                command.Parameters.Add("@AudioFilename", MySqlDbType.VarChar);
                command.Parameters.Add("@RenamedTitle", MySqlDbType.VarChar);
                command.Parameters.Add("@ArtistInFilenameID", MySqlDbType.Int64);

                command.Parameters["@AudioFilename"].Value = artistsTitle;
                command.Parameters["@RenamedTitle"].Value = audioTitle;
                command.Parameters["@ArtistInFilenameID"].Value = artistInFilenameID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertAudioFilenameInDatabase: " + ex.Message);
            }
        }

        internal static object GetArtistByNameFromDatabase(string artist) {
            try {
                command = new MySqlCommand(selectArtistByNameCommandString, connection);
                command.Parameters.Add("@Artist", MySqlDbType.VarChar);

                command.Parameters["@Artist"].Value = artist;

                return command.ExecuteScalar();
            }
            catch (Exception ex) {
                MessageBox.Show("GetArtistFromDatabase: " + ex.Message);
                return null;
            }
        }

        internal static object InsertPostIntoDatabase(string artist) {
            try {
                command = new MySqlCommand(insertPostCommandString, connection);

                command.ExecuteNonQuery();
                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertPostIntoDatabase: " + ex.Message);
                return null;
            }
        }

        internal static object InsertPostIntoDatabase() {
            try {
                command = new MySqlCommand(insertPostCommandString, connection);

                command.ExecuteNonQuery();
                return command.LastInsertedId;
            }
            catch (Exception ex) {
                MessageBox.Show("InsertPostIntoDatabase: " + ex.Message);
                return null;
            }
        }

        internal static void GetArtistsIDsFromDatabase() {
            try {
                command = new MySqlCommand(selectArtistsIDsCommandString, connection);

                using (DbDataReader reader = command.ExecuteReader()) {
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            columnIndex = reader.GetOrdinal("artist__id");
                            ImagesProcessWindowForm.selectedArtistsIDs.Add(Convert.ToInt64(reader.GetValue(columnIndex)));
                        }
                    }
                }
            }
            catch (Exception ex) {
                MessageBox.Show("GetArtistsIDsFromDatabase: " + ex.Message);
            }
        }

        internal static void GetImageArtistImageIDsFromDatabase(long artistID) {
            try {
                command = new MySqlCommand(selectImageArtistImageIDsCommandString, connection);
                command.Parameters.Add("@ArtistID", MySqlDbType.VarChar);

                command.Parameters["@ArtistID"].Value = artistID;

                using (DbDataReader reader = command.ExecuteReader()) {
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            columnIndex = reader.GetOrdinal("image_artist__image__id");
                            ImagesProcessWindowForm.selectedImagesIDs.Add(Convert.ToInt64(reader.GetValue(columnIndex)));
                        }
                    }
                }
            }
            catch (Exception ex) {
                MessageBox.Show("GetImageArtistImageIDsFromDatabase: " + ex.Message);
            }
        }

        internal static void GetAudioArtistAudioIDsFromDatabase(long artistID) {
            try {
                command = new MySqlCommand(selectAudioArtistAudioIDsCommandString, connection);
                command.Parameters.Add("@ArtistID", MySqlDbType.VarChar);

                command.Parameters["@ArtistID"].Value = artistID;

                using (DbDataReader reader = command.ExecuteReader()) {
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            columnIndex = reader.GetOrdinal("audio_artist__audio__id");
                            ImagesProcessWindowForm.selectedAudiosIDs.Add(Convert.ToInt64(reader.GetValue(columnIndex)));
                        }
                    }
                }
            }
            catch (Exception ex) {
                MessageBox.Show("GetAudioArtistAudioIDsFromDatabase: " + ex.Message);
            }
        }

        internal static void InsertPostImageInDatabase(long postID, long imageID) {
            try {
                command = new MySqlCommand(insertPostImageCommandString, connection);
                command.Parameters.Add("@PostID", MySqlDbType.Int64);
                command.Parameters.Add("@ImageID", MySqlDbType.Int64);

                command.Parameters["@PostID"].Value = postID;
                command.Parameters["@ImageID"].Value = imageID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertPostImageInDatabase: " + ex.Message);
            }
        }

        internal static void InsertPostAudioInDatabase(long postID, long audioID) {
            try {
                command = new MySqlCommand(insertPostAudioCommandString, connection);
                command.Parameters.Add("@PostID", MySqlDbType.Int64);
                command.Parameters.Add("@AudioID", MySqlDbType.Int64);

                command.Parameters["@PostID"].Value = postID;
                command.Parameters["@AudioID"].Value = audioID;

                command.ExecuteNonQuery();
            }
            catch (Exception ex) {
                MessageBox.Show("InsertPostAudioInDatabase: " + ex.Message);
            }
        }
    }
}