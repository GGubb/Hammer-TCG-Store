import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  try {
    const { producto, nombre, rut, correo, fecha } = req.body;

    if (!nombre || !correo || !producto || !rut || !fecha) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos" });
    }

    const msg = {
      to: "matiasmelo1999@gmail.com", // 📩 Receptor
      from: "matiasmelo1999@gmail.com", // ⚠️ Debe ser verificado en SendGrid
      subject: `Nueva reserva: ${producto}`,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        ">
          <div style="
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          ">
            <h2 style="color: #c0392b; text-align: center;">Nueva Reserva Recibida 🛒</h2>
            <p style="font-size: 16px;">Has recibido una nueva reserva desde el sitio web de <strong>Hammer TCG Store</strong>.</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">📦 Producto:</td>
                <td style="padding: 8px;">${producto}</td>
              </tr>
              <tr style="background-color: #fafafa;">
                <td style="padding: 8px; font-weight: bold;">👤 Nombre:</td>
                <td style="padding: 8px;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">🧾 RUT:</td>
                <td style="padding: 8px;">${rut}</td>
              </tr>
              <tr style="background-color: #fafafa;">
                <td style="padding: 8px; font-weight: bold;">📧 Correo:</td>
                <td style="padding: 8px;">${correo}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">🗓 Fecha:</td>
                <td style="padding: 8px;">${new Date(fecha).toLocaleString("es-CL")}</td>
              </tr>
            </table>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Este correo fue generado automáticamente desde el formulario de reservas.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ mensaje: "Correo enviado con éxito ✅" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ mensaje: "Error al enviar el correo" });
  }
}


