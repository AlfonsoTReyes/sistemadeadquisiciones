// --- START OF FILE src/app/api/proveedorusuario/signup/route.ts (Adjusted for Apellidos) ---
import { NextRequest, NextResponse } from 'next/server';
import {
    getProveedorUserByUsername,
    createProveedorUser,
    checkProveedorUsernameExists,
    checkProveedorEmailExists
} from '../../../../services/proveedorusuarioservice'; // Adjust path if needed

export async function POST(req: NextRequest) {
    console.log("DEBUG: Hit /api/proveedorusuario/signup endpoint");

    try {
        // Destructure new apellido fields
        const { usuario, nombre, apellidoPaterno, apellidoMaterno, correo, contraseña } = await req.json();

        // Basic Validation - check apellidoPaterno (assuming it's required)
        if (!usuario || !nombre || !apellidoPaterno || !correo || !contraseña) {
            // Note: apellidoMaterno might be optional
            return NextResponse.json({ message: 'Usuario, nombre, apellido paterno, correo y contraseña son requeridos' }, { status: 400 });
        }

        const usernameExists = await checkProveedorUsernameExists(usuario);
        if (usernameExists) {
            return NextResponse.json({ message: `El nombre de usuario '${usuario}' ya existe.` }, { status: 409 });
        }
        const emailExists = await checkProveedorEmailExists(correo);
        if (emailExists) {
            return NextResponse.json({ message: `El correo electrónico '${correo}' ya está registrado.` }, { status: 409 });
        }

        // Call service with new apellido fields
        const nuevoUsuarioProveedor = await createProveedorUser({
            usuario, nombre, apellidoPaterno, apellidoMaterno, correo, contraseña
        });

        return NextResponse.json({ message: "Usuario proveedor registrado exitosamente", usuario: nuevoUsuarioProveedor }, { status: 201 });

    } catch (error: any) {
        console.error("Error en signup de proveedor:", error);
        if (error.message.includes("ya existe") || error.message.includes("ya está registrado")) {
            return NextResponse.json({ message: error.message }, { status: 409 });
        }
        return NextResponse.json({ message: error.message || "Error en el servidor durante el registro" }, { status: 500 });
    }
}
// --- END OF FILE src/app/api/proveedorusuario/signup/route.ts ---