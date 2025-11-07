import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  try {
    const { nombre, correo, fecha } = req.body;

    if (!nombre || !correo || !fecha) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos" });
    }

    // Construimos el mensaje
    const msg = {
      to: "matiasmelo1999@gmail.com", 
      from: "matiasmelo1999@gmail.com", 
      subject: "Nueva reserva desde la tienda",
      text: `Nombre: ${nombre}\nCorreo: ${correo}\nFecha: ${fecha}`,
      html: `
        <h2>Nueva reserva</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
      `,
    };

    // Enviar el correo
    await sgMail.send(msg);

    res.status(200).json({ mensaje: "Correo enviado con éxito ✅" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ mensaje: "Error al enviar el correo" });
  }
}
