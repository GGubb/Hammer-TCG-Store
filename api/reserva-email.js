import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  try {
    const { nombre, correo, instagram, fecha, rut, producto } = req.body;

    if (!nombre || !correo || !fecha) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos" });
    }

    const msg = {
      to: "matiasmelo1999@gmail.com",
      from: "matiasmelo1999@gmail.com",
      subject: "🛒 Nueva reserva en Hammer TCG Store",
      text: `
        Nombre: ${nombre}
        Correo: ${correo}
        Instagram: ${instagram}
        ${rut ? `RUT: ${rut}` : ""}
        ${producto ? `Producto: ${producto}` : ""}
        Fecha: ${fecha}
      `,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
            
            <div style="background: linear-gradient(90deg, #222, #555); padding: 16px 24px;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Hammer TCG Store</h1>
            </div>

            <div style="padding: 24px;">
              <h2 style="color: #333333; font-size: 18px; margin-bottom: 16px;">Nueva reserva recibida</h2>
              <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Se ha registrado una nueva reserva a través del sitio web.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #222;">Nombre:</td>
                  <td style="padding: 8px; color: #444;">${nombre}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                  <td style="padding: 8px; font-weight: bold; color: #222;">Correo:</td>
                  <td style="padding: 8px; color: #444;">${correo}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                  <td style="padding: 8px; font-weight: bold; color: #222;">Correo:</td>
                  <td style="padding: 8px; color: #444;">${instagram}</td>
                </tr>
                ${rut ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #222;">RUT:</td>
                  <td style="padding: 8px; color: #444;">${rut}</td>
                </tr>` : ""}
                ${producto ? `
                <tr style="background-color: #f2f2f2;">
                  <td style="padding: 8px; font-weight: bold; color: #222;">Producto:</td>
                  <td style="padding: 8px; color: #444;">${producto}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #222;">Fecha:</td>
                  <td style="padding: 8px; color: #444;">${new Date(fecha).toLocaleString("es-CL")}</td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding: 12px 16px; background-color: #f0f0f0; border-left: 4px solid #222; color: #555;">
                Recuerda revisar tu panel de reservas en Supabase para confirmar disponibilidad.
              </div>
            </div>

            <div style="background: #222; color: #ccc; text-align: center; font-size: 12px; padding: 12px;">
              © ${new Date().getFullYear()} Hammer TCG Store — Todos los derechos reservados.
            </div>

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

