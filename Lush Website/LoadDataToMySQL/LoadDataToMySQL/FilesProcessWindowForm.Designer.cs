namespace LoadDataToMySQL {
    partial class ImagesProcessWindowForm {
        /// <summary>
        /// Обязательная переменная конструктора.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Освободить все используемые ресурсы.
        /// </summary>
        /// <param name="disposing">истинно, если управляемый ресурс должен быть удален; иначе ложно.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Код, автоматически созданный конструктором форм Windows

        /// <summary>
        /// Требуемый метод для поддержки конструктора — не изменяйте 
        /// содержимое этого метода с помощью редактора кода.
        /// </summary>
        private void InitializeComponent() {
            this.ProcessPanel = new System.Windows.Forms.Panel();
            this.ProgressBar = new System.Windows.Forms.ProgressBar();
            this.ProcessPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // ProcessPanel
            // 
            this.ProcessPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ProcessPanel.Controls.Add(this.ProgressBar);
            this.ProcessPanel.Location = new System.Drawing.Point(0, 0);
            this.ProcessPanel.Name = "ProcessPanel";
            this.ProcessPanel.Size = new System.Drawing.Size(602, 82);
            this.ProcessPanel.TabIndex = 6;
            // 
            // ProgressBar
            // 
            this.ProgressBar.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.ProgressBar.Location = new System.Drawing.Point(28, 29);
            this.ProgressBar.Name = "ProgressBar";
            this.ProgressBar.Size = new System.Drawing.Size(548, 23);
            this.ProgressBar.TabIndex = 0;
            // 
            // ImagesProcessWindowForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(602, 81);
            this.Controls.Add(this.ProcessPanel);
            this.Name = "ImagesProcessWindowForm";
            this.Text = "Lush";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.ImagesProcessWindowForm_FormClosed);
            this.Load += new System.EventHandler(this.ProcessWindow_Load);
            this.ProcessPanel.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.Panel ProcessPanel;
        private System.Windows.Forms.ProgressBar ProgressBar;
    }
}

