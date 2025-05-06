import React from 'react';

export default function CondicionesUsoProveedoresPage() {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Condiciones de Uso para Proveedores - [Nombre de tu Empresa/Plataforma]</title>
        <style>
            body { font-family: sans-serif; line-height: 1.6; margin: 0; color: #333; background-color: #fff; }
            .container { max-width: 800px; margin: 20px auto; background: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            h1, h2, h3 { color: #111; }
            h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
            strong { font-weight: bold; }
            ul { margin-left: 20px; padding-left: 0; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .date { font-size: 0.9em; color: #555; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Condiciones de Uso para Proveedores</h1>
            <p class="date"><strong>Última actualización:</strong> [Fecha de Última Actualización]</p>

            <p>Bienvenido al portal de proveedores de <strong>[Nombre de tu Empresa/Plataforma]</strong> (en adelante, "nosotros", "nuestro" o "la Empresa"). Estas Condiciones de Uso (en adelante, las "Condiciones") rigen su acceso y uso de nuestro portal de registro y cualquier servicio relacionado ofrecido a proveedores (colectivamente, los "Servicios para Proveedores").</p>

            <p>Al registrarse como proveedor y utilizar nuestros Servicios para Proveedores, usted acepta estar legalmente obligado por estas Condiciones y nuestro <a href="/aviso-privacidad-general" target="_blank">Aviso de Privacidad General para Proveedores</a>. Si no está de acuerdo con alguna parte de estas Condiciones, no debe utilizar los Servicios para Proveedores.</p>

            <h2>1. ELEGIBILIDAD Y REGISTRO</h2>
            <p>Para registrarse como proveedor, usted debe ser una persona física con capacidad legal para contratar o una entidad legal debidamente constituida y con licencia para operar. Usted declara y garantiza que toda la información proporcionada durante el proceso de registro es verdadera, precisa, actual y completa. Usted es responsable de mantener la confidencialidad de cualquier credencial de acceso a su cuenta y de todas las actividades que ocurran bajo su cuenta.</p>
            <p>Nos reservamos el derecho de rechazar o cancelar un registro de proveedor a nuestra entera discreción, sin previo aviso ni responsabilidad.</p>

            <h2>2. USO ACEPTABLE DE LOS SERVICIOS PARA PROVEEDORES</h2>
            <p>Usted se compromete a utilizar los Servicios para Proveedores únicamente para fines lícitos y de acuerdo con estas Condiciones. Usted no deberá:</p>
            <ul>
                <li>Proporcionar información falsa, engañosa o inexacta.</li>
                <li>Intentar obtener acceso no autorizado a nuestros sistemas o a las cuentas de otros usuarios.</li>
                <li>Utilizar los Servicios para Proveedores de manera que pueda dañar, deshabilitar, sobrecargar o deteriorar nuestros servidores o redes.</li>
                <li>Transmitir cualquier material que contenga virus, troyanos, gusanos u otros componentes dañinos o disruptivos.</li>
                <li>Infringir cualquier ley, reglamento o derecho de terceros aplicable.</li>
                <li>Participar en cualquier actividad que consideremos, a nuestra entera discreción, que sea abusiva, fraudulenta o perjudicial para la Empresa o nuestros usuarios.</li>
            </ul>

            <h2>3. DATOS DEL PROVEEDOR Y DOCUMENTACIÓN</h2>
            <p>Usted es el único responsable de la exactitud, integridad y legalidad de todos los datos, información y documentos que envíe a través de los Servicios para Proveedores ("Datos del Proveedor"). Usted declara y garantiza que tiene todos los derechos necesarios para proporcionar los Datos del Proveedor y que dichos datos no infringen los derechos de ningún tercero.</p>
            <p>Usted nos otorga una licencia no exclusiva, mundial y libre de regalías para usar, reproducir, modificar (para fines de formato o adaptación a nuestros sistemas) y mostrar los Datos del Proveedor con el único propósito de proporcionarle los Servicios para Proveedores y gestionar nuestra relación comercial.</p>
            <p>Podemos solicitarle que proporcione documentación adicional para verificar su identidad, capacidad legal, situación fiscal, cumplimiento normativo u otros aspectos relevantes para su condición de proveedor. La falta de presentación de la documentación solicitada de manera oportuna puede resultar en la suspensión o terminación de su cuenta de proveedor.</p>

            <h2>4. CONFIDENCIALIDAD</h2>
            <p>Durante el curso de nuestra relación comercial, usted puede tener acceso a información confidencial de la Empresa. Usted se compromete a mantener dicha información en estricta confidencialidad y a no divulgarla a terceros sin nuestro consentimiento previo por escrito, excepto cuando sea requerido por ley.</p>

            <h2>5. PROPIEDAD INTELECTUAL</h2>
            <p>Todos los derechos, títulos e intereses sobre los Servicios para Proveedores, incluyendo nuestro sitio web, software, logotipos, marcas comerciales y cualquier material asociado (excluyendo sus Datos del Proveedor), son y seguirán siendo propiedad exclusiva de <strong>[Nombre de tu Empresa/Plataforma]</strong> y sus licenciantes. Estas Condiciones no le otorgan ningún derecho a utilizar nuestras marcas comerciales o logotipos sin nuestro permiso previo por escrito.</p>

            <h2>6. MODIFICACIONES A LOS SERVICIOS Y CONDICIONES</h2>
            <p>Nos reservamos el derecho de modificar, suspender o interrumpir cualquier aspecto de los Servicios para Proveedores en cualquier momento, con o sin previo aviso. También podemos modificar estas Condiciones periódicamente. Publicaremos cualquier cambio en esta página y actualizaremos la fecha de "Última actualización". Su uso continuado de los Servicios para Proveedores después de la publicación de los cambios constituirá su aceptación de dichas modificaciones.</p>

            <h2>7. TERMINACIÓN</h2>
            <p>Podemos suspender o terminar su acceso a los Servicios para Proveedores, a nuestra entera discreción, por cualquier motivo, incluyendo, entre otros, el incumplimiento de estas Condiciones. Usted puede solicitar la cancelación de su cuenta de proveedor en cualquier momento contactándonos.</p>
            <p>Las disposiciones que por su naturaleza deban sobrevivir a la terminación (incluyendo, entre otras, las relativas a confidencialidad, propiedad intelectual, exenciones de garantía y limitaciones de responsabilidad) seguirán vigentes después de la terminación.</p>

            <h2>8. EXENCIÓN DE GARANTÍAS</h2>
            <p>LOS SERVICIOS PARA PROVEEDORES SE PROPORCIONAN "TAL CUAL" Y "SEGÚN DISPONIBILIDAD", SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS, INCLUYENDO, ENTRE OTRAS, GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN PARTICULAR Y NO INFRACCIÓN. NO GARANTIZAMOS QUE LOS SERVICIOS SERÁN ININTERRUMPIDOS, SEGUROS O LIBRES DE ERRORES.</p>

            <h2>9. LIMITACIÓN DE RESPONSABILIDAD</h2>
            <p>EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, EN NINGÚN CASO <strong>[Nombre de tu Empresa/Plataforma]</strong> SERÁ RESPONSABLE POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, NI POR PÉRDIDA DE BENEFICIOS O INGRESOS, YA SEAN INCURRIDOS DIRECTA O INDIRECTAMENTE, O CUALQUIER PÉRDIDA DE DATOS, USO, FONDO DE COMERCIO U OTRAS PÉRDIDAS INTANGIBLES, RESULTANTES DE (A) SU ACCESO O USO O INCAPACIDAD DE ACCEDER O UTILIZAR LOS SERVICIOS PARA PROVEEDORES; (B) CUALQUIER CONDUCTA O CONTENIDO DE TERCEROS EN LOS SERVICIOS; O (C) ACCESO, USO O ALTERACIÓN NO AUTORIZADOS DE SUS TRANSMISIONES O CONTENIDO.</p>
            <p>NUESTRA RESPONSABILIDAD TOTAL AGREGADA HACIA USTED POR TODAS LAS RECLAMACIONES RELACIONADAS CON LOS SERVICIOS PARA PROVEEDORES NO EXCEDERÁ LA CANTIDAD DE [Especificar un monto nominal, ej: CIEN PESOS MEXICANOS (MXN $100.00) o el monto pagado por usted, si aplica, en los últimos seis meses].</p>

            <h2>10. INDEMNIZACIÓN</h2>
            <p>Usted acepta defender, indemnizar y eximir de responsabilidad a <strong>[Nombre de tu Empresa/Plataforma]</strong> y a sus directivos, empleados y agentes, de y contra cualquier reclamación, daño, obligación, pérdida, responsabilidad, costo o deuda y gastos (incluidos, entre otros, los honorarios de abogados) que surjan de: (i) su uso y acceso a los Servicios para Proveedores; (ii) su violación de cualquier término de estas Condiciones; (iii) su violación de cualquier derecho de terceros, incluyendo, sin limitación, cualquier derecho de autor, propiedad o privacidad; o (iv) cualquier reclamación de que sus Datos del Proveedor causaron daños a un tercero.</p>

            <h2>11. LEY APLICABLE Y JURISDICCIÓN</h2>
            <p>Estas Condiciones se regirán e interpretarán de acuerdo con las leyes de <strong>[Especificar País y, si aplica, Estado/Ciudad, ej: los Estados Unidos Mexicanos, y cualquier disputa se someterá a los tribunales competentes de la Ciudad de México]</strong>, sin tener en cuenta sus disposiciones sobre conflicto de leyes.</p>

            <h2>12. ACUERDO COMPLETO</h2>
            <p>Estas Condiciones, junto con el Aviso de Privacidad General para Proveedores, constituyen el acuerdo completo entre usted y <strong>[Nombre de tu Empresa/Plataforma]</strong> con respecto a los Servicios para Proveedores y reemplazan todos los acuerdos o entendimientos anteriores o contemporáneos, ya sean escritos u orales.</p>

            <h2>13. CONTACTO</h2>
            <p>Si tiene alguna pregunta sobre estas Condiciones de Uso, por favor contáctenos en:</p>
            <p>
                <strong>[Nombre de tu Empresa/Plataforma]</strong><br />
                Correo electrónico: <strong>[Tu Dirección de Correo Electrónico de Contacto]</strong><br />
                Dirección: <strong>[Tu Dirección Física, si aplica]</strong>
            </p>
        </div>
    </body>
    </html>
  `;
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}