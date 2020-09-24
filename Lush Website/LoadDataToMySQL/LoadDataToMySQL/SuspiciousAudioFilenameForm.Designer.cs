namespace LoadDataToMySQL {
    partial class SuspiciousAudioFilenameForm {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            this.MainPanel = new System.Windows.Forms.Panel();
            this.OKButon = new System.Windows.Forms.Button();
            this.Title = new System.Windows.Forms.Label();
            this.Artist = new System.Windows.Forms.Label();
            this.TitleBox = new System.Windows.Forms.TextBox();
            this.ArtistBox = new System.Windows.Forms.TextBox();
            this.Message = new System.Windows.Forms.Label();
            this.ResetArtistButton = new System.Windows.Forms.Button();
            this.ResetTitleButton = new System.Windows.Forms.Button();
            this.MainPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // MainPanel
            // 
            this.MainPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.MainPanel.Controls.Add(this.ResetTitleButton);
            this.MainPanel.Controls.Add(this.ResetArtistButton);
            this.MainPanel.Controls.Add(this.OKButon);
            this.MainPanel.Controls.Add(this.Title);
            this.MainPanel.Controls.Add(this.Artist);
            this.MainPanel.Controls.Add(this.TitleBox);
            this.MainPanel.Controls.Add(this.ArtistBox);
            this.MainPanel.Controls.Add(this.Message);
            this.MainPanel.Location = new System.Drawing.Point(0, 0);
            this.MainPanel.Name = "MainPanel";
            this.MainPanel.Size = new System.Drawing.Size(444, 202);
            this.MainPanel.TabIndex = 0;
            // 
            // OKButon
            // 
            this.OKButon.Location = new System.Drawing.Point(184, 151);
            this.OKButon.Name = "OKButon";
            this.OKButon.Size = new System.Drawing.Size(75, 23);
            this.OKButon.TabIndex = 5;
            this.OKButon.Text = "OK";
            this.OKButon.UseVisualStyleBackColor = true;
            this.OKButon.Click += new System.EventHandler(this.OKButon_Click);
            // 
            // Title
            // 
            this.Title.AutoSize = true;
            this.Title.Location = new System.Drawing.Point(34, 113);
            this.Title.Name = "Title";
            this.Title.Size = new System.Drawing.Size(30, 13);
            this.Title.TabIndex = 4;
            this.Title.Text = "Title:";
            // 
            // Artist
            // 
            this.Artist.AutoSize = true;
            this.Artist.Location = new System.Drawing.Point(31, 78);
            this.Artist.Name = "Artist";
            this.Artist.Size = new System.Drawing.Size(33, 13);
            this.Artist.TabIndex = 3;
            this.Artist.Text = "Artist:";
            // 
            // TitleBox
            // 
            this.TitleBox.Location = new System.Drawing.Point(70, 110);
            this.TitleBox.Name = "TitleBox";
            this.TitleBox.Size = new System.Drawing.Size(305, 20);
            this.TitleBox.TabIndex = 2;
            this.TitleBox.KeyDown += new System.Windows.Forms.KeyEventHandler(this.TitleBox_KeyDown);
            // 
            // ArtistBox
            // 
            this.ArtistBox.Location = new System.Drawing.Point(70, 75);
            this.ArtistBox.Name = "ArtistBox";
            this.ArtistBox.Size = new System.Drawing.Size(305, 20);
            this.ArtistBox.TabIndex = 1;
            this.ArtistBox.KeyDown += new System.Windows.Forms.KeyEventHandler(this.ArtistBox_KeyDown);
            // 
            // Message
            // 
            this.Message.AutoSize = true;
            this.Message.Location = new System.Drawing.Point(138, 35);
            this.Message.Name = "Message";
            this.Message.Size = new System.Drawing.Size(177, 13);
            this.Message.TabIndex = 0;
            this.Message.Text = "Change the name at your discretion.";
            // 
            // ResetArtistButton
            // 
            this.ResetArtistButton.Location = new System.Drawing.Point(382, 73);
            this.ResetArtistButton.Name = "ResetArtistButton";
            this.ResetArtistButton.Size = new System.Drawing.Size(50, 23);
            this.ResetArtistButton.TabIndex = 6;
            this.ResetArtistButton.Text = "Reset";
            this.ResetArtistButton.UseVisualStyleBackColor = true;
            this.ResetArtistButton.Click += new System.EventHandler(this.ResetArtistButton_Click);
            // 
            // ResetTitleButton
            // 
            this.ResetTitleButton.Location = new System.Drawing.Point(382, 108);
            this.ResetTitleButton.Name = "ResetTitleButton";
            this.ResetTitleButton.Size = new System.Drawing.Size(50, 23);
            this.ResetTitleButton.TabIndex = 7;
            this.ResetTitleButton.Text = "Reset";
            this.ResetTitleButton.UseVisualStyleBackColor = true;
            this.ResetTitleButton.Click += new System.EventHandler(this.ResetTitleButton_Click);
            // 
            // SuspiciousAudioFilenameForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(444, 202);
            this.Controls.Add(this.MainPanel);
            this.Name = "SuspiciousAudioFilenameForm";
            this.Text = "Suspicious audio name";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.SuspiciousAudioFilenameForm_FormClosed);
            this.Load += new System.EventHandler(this.SuspiciousAudioFilenameForm_Load);
            this.MainPanel.ResumeLayout(false);
            this.MainPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Panel MainPanel;
        private System.Windows.Forms.Label Message;
        public System.Windows.Forms.TextBox ArtistBox;
        private System.Windows.Forms.Label Title;
        private System.Windows.Forms.Label Artist;
        private System.Windows.Forms.TextBox TitleBox;
        private System.Windows.Forms.Button OKButon;
        private System.Windows.Forms.Button ResetTitleButton;
        private System.Windows.Forms.Button ResetArtistButton;
    }
}