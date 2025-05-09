import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, inputBitacora } from "../../../services/loginservice";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION } from "../../../config/jwtConfig";

export async function POST(req: NextRequest) {
    try {
        const { email, password, operacion, tabla_afectada, datos_nuevos } = await req.json();
        const usuario = await getUserByEmail(email);

        if (!usuario) {
            return NextResponse.json({ message: "Email no encontrado" }, { status: 404 });
        }

        // Verifica la contraseña usando bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        // Registrar en la bitácora
        await inputBitacora(email, operacion, tabla_afectada, datos_nuevos);

        // Enviar el token al frontend
        return NextResponse.json({ message: "Login exitoso", usuario});
        // return NextResponse.json({ message: "Login exitoso", token, usuario});

    } catch (error) {
        console.error("Error en la solicitud POST:", error);
        return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
    }
}
