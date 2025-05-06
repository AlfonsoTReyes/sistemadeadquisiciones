import React from 'react';

// Opcional: Si quieres usar un layout específico para estas páginas legales
// import LegalLayout from '@/components/Layouts/LegalLayout'; // Ajusta la ruta

export default function AvisoPrivacidadGeneralPage() {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Aviso de Privacidad General para Proveedores - [Nombre de tu Empresa/Plataforma]</title>
        <style>
            body { font-family: sans-serif; line-height: 1.6; margin: 0; color: #333; background-color: #fff; } /* Ajusta margin y background */
            .container { max-width: 800px; margin: 20px auto; background: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            h1, h2, h3 { color: #111; }
            h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
            strong { font-weight: bold; }
            ul { margin-left: 20px; padding-left: 0; } /* Ajusta padding para ul */
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .date { font-size: 0.9em; color: #555; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Aviso de Privacidad General para Proveedores</h1>
            <p class="date"><strong>Última actualización:</strong> [Fecha de Última Actualización]</p>
            
            <p>Su privacidad es importante para nosotros. <strong>[Nombre de tu Empresa/Plataforma]</strong> (en adelante, "nosotros", "nuestro" o "la Empresa") ha creado este Aviso de Privacidad para informar a nuestros proveedores y potenciales proveedores (en adelante, "usted" o "el Proveedor") sobre nuestras prácticas de recopilación, uso y divulgación de datos personales en relación con el proceso de registro y la relación comercial.</p>

            <p>Este Aviso de Privacidad se aplica a los datos personales que recopilamos a través de nuestro formulario de registro de proveedores, nuestro sitio web <strong>[URL de tu Sitio Web]</strong> (el "Sitio") y cualquier otra interacción relacionada con su condición de proveedor.</p>

            <h2>1. DATOS PERSONALES QUE RECOPILAMOS</h2>
            <p>Los datos personales que recopilamos dependen de su interacción con nosotros y el tipo de proveedor que sea (persona física o moral). Estos pueden incluir:</p>
            <ul>
                <li><strong>Información de Identificación y Contacto:</strong>
                    <ul>
                        <li>Para personas físicas: Nombre completo (nombre(s), apellido paterno, apellido materno), RFC, CURP, correo electrónico, número(s) de teléfono, dirección completa (calle, número, colonia, código postal, municipio, estado).</li>
                        <li>Para personas morales: Razón social, RFC, correo electrónico de contacto, número(s) de teléfono, dirección completa (calle, número, colonia, código postal, municipio, estado).</li>
                        <li>Información de Representantes Legales (para personas morales): Nombre completo, apellido paterno, apellido materno.</li>
                    </ul>
                </li>
                <li><strong>Información Fiscal y Comercial:</strong>
                    <ul>
                        <li>Giro comercial, actividad económica registrada ante el SAT.</li>
                        <li>Información sobre cámara comercial y números de registro (si aplica).</li>
                        <li>Número de registro IMSS (si aplica).</li>
                        <li>Página web (si aplica).</li>
                        <li>Información sobre si es un proveedor relevante para eventos.</li>
                    </ul>
                </li>
                <li><strong>Información que usted proporciona directamente:</strong> Cualquier otro dato que nos proporcione voluntariamente durante el proceso de registro o la relación comercial, incluyendo los documentos que adjunte.</li>
                <li><strong>Información recopilada automáticamente (al usar nuestro Sitio):</strong> Podemos recopilar cierta información automáticamente cuando visita nuestro Sitio, como su dirección IP, tipo de navegador, sistema operativo, páginas visitadas y fechas/horas de acceso. Utilizamos esta información para el funcionamiento y mejora de nuestro Sitio.</li>
            </ul>

            <h2>2. USO DE SUS DATOS PERSONALES</h2>
            <p>Utilizamos los datos personales que recopilamos para los siguientes propósitos:</p>
            <ul>
                <li><strong>Gestión del Registro de Proveedores:</strong> Para procesar su solicitud de registro, verificar su información y crear su perfil de proveedor en nuestro sistema.</li>
                <li><strong>Comunicación:</strong> Para comunicarnos con usted sobre su registro, solicitudes, pagos, oportunidades comerciales, actualizaciones de nuestros servicios o políticas, y otros asuntos relevantes para la relación de proveedor.</li>
                <li><strong>Cumplimiento de Obligaciones Contractuales y Legales:</strong> Para cumplir con nuestras obligaciones contractuales con usted y con las disposiciones legales aplicables (fiscales, mercantiles, etc.).</li>
                <li><strong>Operación y Mejora de Nuestros Servicios:</strong> Para administrar nuestra base de datos de proveedores, facilitar la interacción entre la Empresa y los proveedores, y mejorar nuestros procesos internos.</li>
                <li><strong>Seguridad:</strong> Para proteger la seguridad de nuestra plataforma, prevenir fraudes y actividades no autorizadas.</li>
                <li><strong>Análisis y Reportes Internos:</strong> Para realizar análisis estadísticos y generar reportes internos (de forma agregada y anonimizada siempre que sea posible) para la toma de decisiones.</li>
                <li><strong>Eventos:</strong> Si indica ser un proveedor relevante para eventos, para contactarle en relación con la organización y participación en dichos eventos.</li>
            </ul>

            <h2>3. DIVULGACIÓN DE SUS DATOS PERSONALES</h2>
            <p>Podemos compartir sus datos personales en las siguientes circunstancias:</p>
            <ul>
                <li><strong>Con su Consentimiento:</strong> Cuando usted nos autorice a compartir su información.</li>
                <li><strong>Proveedores de Servicios:</strong> Con terceros que nos prestan servicios y que necesitan acceder a sus datos para realizar dichos servicios en nuestro nombre (ej. servicios de alojamiento de datos, plataformas de comunicación, asesores legales o contables). Exigimos a estos proveedores que protejan sus datos y los utilicen únicamente para los fines para los que se los proporcionamos.</li>
                <li><strong>Obligaciones Legales:</strong> Cuando sea necesario para cumplir con una obligación legal, una orden judicial o un requerimiento de autoridades competentes.</li>
                <li><strong>Protección de Derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad, o los de nuestros usuarios u otros terceros.</li>
                <li><strong>Transacciones Corporativas:</strong> En caso de una fusión, adquisición, reorganización, quiebra u otra transacción similar, sus datos personales pueden ser transferidos como parte de los activos de la empresa.</li>
            </ul>
            <p>No vendemos sus datos personales a terceros.</p>

            <h2>4. SEGURIDAD DE SUS DATOS PERSONALES</h2>
            <p>Tomamos medidas razonables y apropiadas para proteger sus datos personales contra el acceso, uso, divulgación, alteración y destrucción no autorizados. Sin embargo, ningún sistema de transmisión o almacenamiento de datos es completamente seguro, por lo que no podemos garantizar la seguridad absoluta de su información.</p>

            <h2>5. RETENCIÓN DE DATOS PERSONALES</h2>
            <p>Conservaremos sus datos personales durante el tiempo que sea necesario para cumplir con los fines para los que fueron recopilados, para cumplir con nuestras obligaciones legales (por ejemplo, requisitos fiscales o de auditoría), resolver disputas y hacer cumplir nuestros acuerdos.</p>

            <h2>6. SUS DERECHOS DE PRIVACIDAD</h2>
            <p>Dependiendo de su jurisdicción, usted puede tener ciertos derechos con respecto a sus datos personales, tales como:</p>
            <ul>
                <li><strong>Acceso:</strong> El derecho a solicitar acceso a los datos personales que tenemos sobre usted.</li>
                <li><strong>Rectificación:</strong> El derecho a solicitar la corrección de datos personales inexactos o incompletos.</li>
                <li><strong>Cancelación (Supresión):</strong> El derecho a solicitar la eliminación de sus datos personales bajo ciertas circunstancias.</li>
                <li><strong>Oposición:</strong> El derecho a oponerse al procesamiento de sus datos personales bajo ciertas circunstancias.</li>
                <li><strong>Portabilidad:</strong> El derecho a solicitar la transferencia de sus datos personales a otro responsable.</li>
                <li><strong>Retirar el Consentimiento:</strong> Si el procesamiento se basa en su consentimiento, el derecho a retirarlo en cualquier momento.</li>
            </ul>
            <p>Para ejercer estos derechos, por favor contáctenos utilizando la información proporcionada en la sección "Contacto". Es posible que necesitemos verificar su identidad antes de procesar su solicitud.</p>

            <h2>7. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
            <p>Nuestro Sitio puede utilizar cookies y tecnologías similares para mejorar su experiencia de usuario, analizar el tráfico y personalizar el contenido. Puede configurar su navegador para rechazar las cookies, pero esto podría afectar la funcionalidad de algunas partes de nuestro Sitio. Para más información, consulte nuestra Política de Cookies (si la tiene, enlace aquí).</p>

            <h2>8. CAMBIOS A ESTE AVISO DE PRIVACIDAD</h2>
            <p>Podemos actualizar este Aviso de Privacidad periódicamente. Le notificaremos cualquier cambio material publicando el nuevo aviso en nuestro Sitio y actualizando la fecha de "Última actualización". Le recomendamos revisar este aviso regularmente.</p>

            <h2>9. CONTACTO</h2>
            <p>Si tiene alguna pregunta, queja o inquietud sobre este Aviso de Privacidad o nuestras prácticas de manejo de datos, por favor contáctenos en:</p>
            <p>
                <strong>[Nombre de tu Empresa/Plataforma]</strong><br />
                Atención: Departamento de Privacidad<br />
                Correo electrónico: <strong>[Tu Dirección de Correo Electrónico de Contacto para Privacidad]</strong><br />
                Dirección: <strong>[Tu Dirección Física, si aplica]</strong>
            </p>
        </div>
    </body>
    </html>
  `;

  // Si quieres usar un layout específico:
  // return (
  //   <LegalLayout>
  //     <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  //   </LegalLayout>
  // );

  // Si no usas un layout específico y quieres que se renderice tal cual:
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}