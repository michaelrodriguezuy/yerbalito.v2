const nodemailer = require("nodemailer");

// Configura el transporte SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "olimarteam@gmail.com",
    pass: "tvll igzj ceax nmzs",
  },
});

// Función para enviar el correo electrónico
const sendEmail = async (formData) => {
  try {
    // Configura el mensaje de correo electrónico
    const mailOptions = {
      from: formData.email,
      to: "info@yerbalito.uy",
      subject: "Nuevo mensaje desde la web",
      text: `Nombre: ${formData.name}\nEmail: ${formData.email}\nMensaje: ${formData.message}`,
    };

    // Envía el correo electrónico
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response);
    return { success: true };
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
