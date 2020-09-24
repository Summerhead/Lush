using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using System;
using System.CodeDom;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Common;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace LoadDataToMySQL {
    public partial class ImagesProcessWindowForm : Form {
        private const string contentDirectory = @"D:\docs";
        //internal static long artistInFilenameID;
        private const string imagesTargetDirectory = contentDirectory + @"\images";
        private const string audiosTargetDirectory = contentDirectory + @"\audios";
        private string targetDirectory;
        private IEnumerable<string> filePaths;

        int count = 0;
        private readonly string filenamePattern = @"_|&|,|u0|\+|\[|\]|{|}|\(|\)|~";
        public static string filenameWithoutExtension;
        public static byte[] file;
        public static List<long> selectedArtistsIDs = new List<long>();
        private FileStream fileStream;
        private BinaryReader binaryReader;

        public static string artistsTitle, artists, audioTitle;
        public static string[] artistsArray;
        private int firstStringOccurenceInAudio;
        private readonly string audioArtistTitleSeparator = " - ";
        private readonly string audioArtistsSeparator = " & ";
        private int progress = 0;
        private bool complete = false;

        private MatchCollection matches;
        private string match, newMatch;
        private List<string> insertedArtists = new List<string>();
        private List<long> insertedArtistIDs = new List<long>();
        private long insertedFileID;
        private Dictionary<string, string> artistRenamedArtist = new Dictionary<string, string>();
        private long insertedArtistID;
        private object artistInFilenameID;
        private object selectedArtistID;
        private int artistInFilenameIdIndex;
        private List<string> selectedAudioFilenames = new List<string>();
        internal static List<long> selectedArtists = new List<long>();
        internal static List<long> selectedImagesIDs = new List<long>();
        internal static List<long> selectedAudiosIDs = new List<long>();
        private long postID;
        private object result;

        public ImagesProcessWindowForm() {
            InitializeComponent();
        }

        private void ProcessWindow_Load(object sender, EventArgs e) {
            Run();
        }

        private async void Run() {
            MySqlDbUtils.GetDBConnection();
            MySqlDbUtils.connection.Open();

            //await FetchData();
            await Task.Run(() => CreatePosts());

            MySqlDbUtils.connection.Close();
        }

        private async Task FetchData() {
            await FetchImagesData();
            await FetchAudiosData();
        }

        private async Task FetchImagesData() {
            targetDirectory = imagesTargetDirectory;

            ConfigureSettings();
            await GetImagesData();

            ProgressBar.Value = 0;
            count = 0;
        }

        private async Task FetchAudiosData() {
            targetDirectory = audiosTargetDirectory;

            ConfigureSettings();
            await GetAudiosData();

            ProgressBar.Value = 0;
            count = 0;
        }

        private void ConfigureSettings() {
            SetCurrentTargetDirectory();
            SetProgressBar();
        }

        private void SetCurrentTargetDirectory() {
            filePaths = Directory.GetFiles(targetDirectory).OrderBy(f => new FileInfo(f).CreationTimeUtc);
        }

        private void SetProgressBar() {
            ProgressBar.Minimum = 0;
            ProgressBar.Maximum = filePaths.Count();
            ProgressBar.Value = 0;
            ProgressBar.Step = 1;
        }

        private async Task GetImagesData() {
            foreach (string filename in filePaths) {
                await Task.Factory.StartNew(() => GetImageData(filename))
                    .ContinueWith((t) => UpdateUI(),
                    TaskScheduler.FromCurrentSynchronizationContext());
            }
        }

        private void GetImageData(string filename) {
            filenameWithoutExtension = Path.GetFileNameWithoutExtension(filename);
            artists = filenameWithoutExtension;
            Console.WriteLine("{0}: {1}", ++count, artists);

            ReadFromFile(filename);

            insertedFileID = MySqlDbUtils.InsertImageDataInDatabase();
            artistInFilenameID = MySqlDbUtils.GetArtistInFilenameFromDatabase(artists);
            if (artistInFilenameID != null) {
                selectedArtistsIDs.Clear();
                MySqlDbUtils.GetArtistsInFilenamesFromDatabase(long.Parse(artistInFilenameID.ToString()));

                if (selectedArtistsIDs.Count != 0) {
                    foreach (long artistID in selectedArtistsIDs) {
                        MySqlDbUtils.InsertImageArtistDataInDatabase(insertedFileID, artistID);
                    }
                }
            }
            else {
                if (Regex.IsMatch(artists, filenamePattern) || filename.Length == 256) {
                    new SuspiciousImageFilenameForm().ShowDialog();
                }

                ParseArtists();

                artistInFilenameID = MySqlDbUtils.InsertArtistInFilenameInDatabase(filenameWithoutExtension);
                foreach (string artist in artistsArray) {
                    //Console.WriteLine("Artist: " + artist);
                    try {
                        if (artist.Substring(0, artist.IndexOf(audioArtistTitleSeparator)) == "Unknown Artist") {
                            insertedArtistID = MySqlDbUtils.InsertArtistDataInDatabase(null);
                        }
                    }
                    catch (Exception) {
                        insertedArtistID = MySqlDbUtils.InsertArtistDataInDatabase(artist);
                    }
                    finally {
                        MySqlDbUtils.InsertImageArtistDataInDatabase(insertedFileID, insertedArtistID);
                        MySqlDbUtils.InsertArtistInFilenameArtistInDatabase(long.Parse(artistInFilenameID.ToString()), insertedArtistID);
                    }
                }
            }
            /*Thread.Sleep(1);*/
        }

        private void ReadFromFile(string filename) {
            try {
                fileStream = new FileStream(filename, FileMode.Open, FileAccess.Read);
                binaryReader = new BinaryReader(fileStream);
                file = binaryReader.ReadBytes((int)fileStream.Length);

                binaryReader.Close();
                fileStream.Close();
            }
            catch (Exception e) {
                Console.WriteLine("Error: " + e);
                Console.WriteLine("Failed to fetch: " + filename);
            }
        }

        private void ParseArtists() {
            artistsArray = Regex.Split(artists, audioArtistsSeparator);

            artistsArray = artistsArray
                .Select(artist => {
                    matches = Regex.Matches(artist, " (?:&&) ");
                    if (matches != null) {
                        foreach (Match m in matches) {
                            match = Regex.Match(m.Value, "(?:&&)").Value;
                            newMatch = m.Value.Replace(match, match.Substring(0, match.Length - 1));

                            artist = artist.Replace(m.Value, newMatch);
                        }
                    }

                    return artist;
                }).ToArray();
        }

        private async Task GetAudiosData() {
            foreach (string filename in filePaths) {
                await Task.Factory.StartNew(() => GetAudioData(filename))
                    .ContinueWith((t) => UpdateUI(),
                    TaskScheduler.FromCurrentSynchronizationContext());
            }
        }

        private void GetAudioData(string filename) {
            artistsTitle = Path.GetFileNameWithoutExtension(filename);

            Console.WriteLine("{0}: {1}", ++count, artistsTitle);
            /*Console.WriteLine("Artist: " + artists);
            Console.WriteLine("Title: " + audioTitle);*/

            ReadFromFile(filename);

            artistInFilenameID = MySqlDbUtils.GetAudioFilenameFromDatabase(artistsTitle);
            if (artistInFilenameID != null) {
                insertedFileID = MySqlDbUtils.InsertAudioDataInDatabase();

                selectedArtistsIDs.Clear();
                MySqlDbUtils.GetArtistsInFilenamesFromDatabase(long.Parse(artistInFilenameID.ToString()));

                if (selectedArtistsIDs.Count != 0) {
                    foreach (long artistID in selectedArtistsIDs) {
                        MySqlDbUtils.InsertAudioArtistDataInDatabase(insertedFileID, artistID);
                    }
                }
            }
            else {
                firstStringOccurenceInAudio = artistsTitle.IndexOf(audioArtistTitleSeparator);

                if (firstStringOccurenceInAudio != -1) {
                    artists = artistsTitle.Substring(0, firstStringOccurenceInAudio);
                    audioTitle = artistsTitle.Substring(firstStringOccurenceInAudio + audioArtistTitleSeparator.Length);
                }
                else {
                    artists = null;
                    audioTitle = artistsTitle;
                }

                if (artists == "Unknown Artist") {
                    artists = artistsTitle;
                }
                artistInFilenameID = MySqlDbUtils.GetArtistInFilenameFromDatabase(artists);
                if (artistInFilenameID != null) {
                    if (Regex.Matches(artistsTitle, audioArtistTitleSeparator).Count != 1 ||
                        Regex.IsMatch(audioTitle, filenamePattern) || filename.Length == 256) {
                        using (var dialog = new SuspiciousAudioFilenameForm()) {
                            dialog.ArtistBox.Enabled = false;
                            dialog.ShowDialog();
                        }
                    }

                    insertedFileID = MySqlDbUtils.InsertAudioDataInDatabase();

                    selectedArtistsIDs.Clear();
                    MySqlDbUtils.GetArtistsInFilenamesFromDatabase(long.Parse(artistInFilenameID.ToString()));

                    if (selectedArtistsIDs.Count != 0) {
                        foreach (long artistID in selectedArtistsIDs) {
                            MySqlDbUtils.InsertAudioArtistDataInDatabase(insertedFileID, artistID);
                        }
                    }
                }
                else {
                    artistInFilenameID = MySqlDbUtils.InsertArtistInFilenameInDatabase(artists);

                    if (Regex.Matches(artistsTitle, audioArtistTitleSeparator).Count != 1 ||
                        Regex.IsMatch(artistsTitle, filenamePattern) || filename.Length == 256) {
                        new SuspiciousAudioFilenameForm().ShowDialog();
                    }

                    insertedFileID = MySqlDbUtils.InsertAudioDataInDatabase();

                    ParseArtists();

                    foreach (string artist in artistsArray) {
                        Console.WriteLine("Artist: " + artist);

                        selectedArtistID = MySqlDbUtils.GetArtistByNameFromDatabase(artist);
                        if (selectedArtistID != null) {
                            Console.WriteLine("WTF: " + selectedArtistID);
                            insertedArtistID = long.Parse(selectedArtistID.ToString());
                        }
                        else {
                            insertedArtistID = MySqlDbUtils.InsertArtistDataInDatabase(artist);
                        }

                        MySqlDbUtils.InsertAudioArtistDataInDatabase(insertedFileID, insertedArtistID);
                        MySqlDbUtils.InsertArtistInFilenameArtistInDatabase(long.Parse(artistInFilenameID.ToString()), insertedArtistID);
                    }
                }

                MySqlDbUtils.InsertAudioFilenameInDatabase(artistsTitle, audioTitle, artistInFilenameID);
            }

            /*Thread.Sleep(1);*/
        }

        private void UpdateUI() {
            ProgressBar.PerformStep();
        }

        private void ImagesProcessWindowForm_FormClosed(object sender, FormClosedEventArgs e) {
            if (MySqlDbUtils.connection != null && MySqlDbUtils.connection.State == ConnectionState.Open) {
                MySqlDbUtils.connection.Close();
            }
        }

        private async Task CreatePosts() {
            selectedArtistsIDs.Clear();
            MySqlDbUtils.GetArtistsIDsFromDatabase();

            foreach (long artistID in selectedArtistsIDs) {
                postID = long.Parse(MySqlDbUtils.InsertPostIntoDatabase().ToString());

                selectedImagesIDs.Clear();
                MySqlDbUtils.GetImageArtistImageIDsFromDatabase(artistID);
                foreach (long imageID in selectedImagesIDs) {
                    MySqlDbUtils.InsertPostImageInDatabase(postID, imageID);
                }

                selectedAudiosIDs.Clear();
                MySqlDbUtils.GetAudioArtistAudioIDsFromDatabase(artistID);
                foreach (long audioID in selectedAudiosIDs) {
                    MySqlDbUtils.InsertPostAudioInDatabase(postID, audioID);
                }
            }
        }
    }
}
