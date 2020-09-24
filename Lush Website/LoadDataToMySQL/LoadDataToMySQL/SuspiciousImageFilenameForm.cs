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
    public partial class SuspiciousImageFilenameForm : Form {
        public SuspiciousImageFilenameForm() {
            InitializeComponent();
        }

        private void OKButton_Click(object sender, EventArgs e) {
            Close();
        }

        private void NameBox_KeyDown(object sender, KeyEventArgs e) {
            if (e.KeyCode == Keys.Enter) {
                Close();
            }
        }

        private void SuspiciousImageFilename_Load(object sender, EventArgs e) {
            NameBox.Text = ImagesProcessWindowForm.artists;
        }

        private void SuspiciousImageFilenameForm_FormClosed(object sender, FormClosedEventArgs e) {
            ImagesProcessWindowForm.artists = NameBox.Text;
        }
    }
}
