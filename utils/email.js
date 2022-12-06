const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Email {
  //Hàm tạo
  constructor(user, resetToken, email) {
    this.user = user || "";
    this.to = user?.email || email;
    this.firstName = user?.name.split(" ")[0] || "";
    this.resetToken = resetToken || "";
    this.from = "htrang1801001@gmail.com";
  }

  // Gửi email thực tế
  async send(templateId, subject, dynamic_template_data = {}) {
    // 1. Khai báo các cài đặt email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      templateId,
      dynamic_template_data,
    };
    console.log(mailOptions);

    // 2) Create a transport and send email
    await sgMail.send(mailOptions).then(
      (response) => {
        console.log("mail-sent-successfully", {
          templateId,
          dynamic_template_data,
        });
        console.log("response", response);
      },
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
  }
  async sendPasswordReset() {
    const dynamic_template_data = {
      name: this.user.name,
      resetToken: this.resetToken,
    };
    await this.send(
      "d-bcb5388ba0fe4e749b99bb5c27a48388",
      "Your password reset token (valid for only 10 minutes)",
      dynamic_template_data
    );
  }
  async sendWelcomeEmail() {
    await this.send(
      "d-93c6335f4a6d44849ae9962a091db1b8",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
