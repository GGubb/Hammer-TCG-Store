export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const data = req.body;
  console.log('📩 Nueva reserva:', data);

  // Acá podés usar nodemailer, Resend, SendGrid, etc.
  // Ejemplo con console.log por ahora:
  console.log(`Enviar correo con los datos:
    Producto: ${data.producto}
    Nombre: ${data.nombre}
    RUT: ${data.rut}
    Correo: ${data.correo}
    Fecha: ${data.fecha}
  `);

  // Respuesta al trigger
  res.status(200).json({ message: 'Correo enviado (simulado)' });
}
