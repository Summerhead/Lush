using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace LoadDataToMySQL {
    public partial class SuspiciousAudioFilenameForm : Form {
        public SuspiciousAudioFilenameForm() {
            InitializeComponent();
        }

        private void OKButon_Click(object sender, EventArgs e) {
            Close();
        }

        private void ArtistBox_KeyDown(object sender, KeyEventArgs e) {
            if (e.KeyCode == Keys.Enter) {
                Close();
            }

            if (e.KeyCode == Keys.Tab) {
                TitleBox.Focus();
            }
        }

        private void TitleBox_KeyDown(object sender, KeyEventArgs e) {
            if (e.KeyCode == Keys.Enter) {
                Close();
            }
        }

        private void SuspiciousAudioFilenameForm_Load(object sender, EventArgs e) {
            ArtistBox.Text = ImagesProcessWindowForm.artists;
            TitleBox.Text = ImagesProcessWindowForm.audioTitle;
        }

        private void ResetArtistButton_Click(object sender, EventArgs e) {
            ArtistBox.Text = ImagesProcessWindowForm.artists;
        }

        private void ResetTitleButton_Click(object sender, EventArgs e) {
            TitleBox.Text = ImagesProcessWindowForm.audioTitle;
        }

        private void SuspiciousAudioFilenameForm_FormClosed(object sender, FormClosedEventArgs e) {
            ImagesProcessWindowForm.artists = ArtistBox.Text;
            ImagesProcessWindowForm.audioTitle = TitleBox.Text;
        }
    }
}
