namespace LoadDataToMySQL {
    partial class SuspiciousImageFilenameForm {
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
            this.Message = new System.Windows.Forms.Label();
            this.NameBox = new System.Windows.Forms.TextBox();
            this.MainPanel = new System.Windows.Forms.Panel();
            this.Name = new System.Windows.Forms.Label();
            this.OKButton = new System.Windows.Forms.Button();
            this.MainPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // Message
            // 
            this.Message.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.Message.AutoSize = true;
            this.Message.Location = new System.Drawing.Point(135, 45);
            this.Message.Name = "Message";
            this.Message.Size = new System.Drawing.Size(177, 13);
            this.Message.TabIndex = 0;
            this.Message.Text = "Change the name at your discretion.";
            // 
            // NameBox
            // 
            this.NameBox.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.NameBox.Location = new System.Drawing.Point(66, 77);
            this.NameBox.Name = "NameBox";
            this.NameBox.Size = new System.Drawing.Size(305, 20);
            this.NameBox.TabIndex = 1;
            this.NameBox.KeyDown += new System.Windows.Forms.KeyEventHandler(this.NameBox_KeyDown);
            // 
            // MainPanel
            // 
            this.MainPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.MainPanel.Controls.Add(this.Name);
            this.MainPanel.Controls.Add(this.OKButton);
            this.MainPanel.Controls.Add(this.NameBox);
            this.MainPanel.Controls.Add(this.Message);
            this.MainPanel.Location = new System.Drawing.Point(0, 0);
            this.MainPanel.Name = "MainPanel";
            this.MainPanel.Size = new System.Drawing.Size(442, 177);
            this.MainPanel.TabIndex = 2;
            // 
            // Name
            // 
            this.Name.AutoSize = true;
            this.Name.Location = new System.Drawing.Point(22, 80);
            this.Name.Name = "Name";
            this.Name.Size = new System.Drawing.Size(38, 13);
            this.Name.TabIndex = 3;
            this.Name.Text = "Name:";
            // 
            // OKButton
            // 
            this.OKButton.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.OKButton.Location = new System.Drawing.Point(186, 120);
            this.OKButton.Name = "OKButton";
            this.OKButton.Size = new System.Drawing.Size(75, 23);
            this.OKButton.TabIndex = 2;
            this.OKButton.Text = "OK";
            this.OKButton.UseVisualStyleBackColor = true;
            this.OKButton.Click += new System.EventHandler(this.OKButton_Click);
            // 
            // SuspiciousImageFilenameForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(444, 176);
            this.Controls.Add(this.MainPanel);
            this.Text = "Suspicious image name";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.SuspiciousImageFilenameForm_FormClosed);
            this.Load += new System.EventHandler(this.SuspiciousImageFilename_Load);
            this.MainPanel.ResumeLayout(false);
            this.MainPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label Message;
        private System.Windows.Forms.TextBox NameBox;
        private System.Windows.Forms.Panel MainPanel;
        private System.Windows.Forms.Button OKButton;
        private System.Windows.Forms.Label Name;
    }
}