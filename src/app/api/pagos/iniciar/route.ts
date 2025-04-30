// app/api/pagos/iniciar/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PHP_MODULE_INICIAR_URL = process.env.PHP_MODULE_INICIAR_URL;

if (!PHP_MODULE_INICIAR_URL) {
    console.error("FATAL ERROR: PHP_MODULE_INICIAR_URL no está definido en .env");
}

export async function POST(request: NextRequest) {
    if (!PHP_MODULE_INICIAR_URL) {
        return NextResponse.json({ success: false, message: 'Error de configuración del servidor (URL Módulo PHP).' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { tramite } = body;

        if (!tramite || typeof tramite !== 'string') {
            return NextResponse.json({ success: false, message: 'Parámetro "tramite" inválido o faltante.' }, { status: 400 });
        }

        console.log(`Proxy: Iniciando pago para trámite "${tramite}" via PHP`);

        const urlConParam = `${PHP_MODULE_INICIAR_URL}?tramite=${encodeURIComponent(tramite)}`;
        // Añadir más params GET si iniciar_pago.php los necesita

        const responsePHP = await fetch(urlConParam, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store', // No cachear esta llamada
        });

        console.log(`Proxy: Respuesta PHP Status: ${responsePHP.status}`);
        const responsePHPText = await responsePHP.text();

        let responsePHPData;
        try {
            responsePHPData = JSON.parse(responsePHPText);
        } catch (e) {
            console.error("Proxy: Respuesta PHP no es JSON:", responsePHPText.substring(0, 500));
            throw new Error("Respuesta inválida del módulo de pago PHP.");
        }

        console.log("Proxy: Respuesta JSON de PHP:", responsePHPData);

        // Reenviar respuesta y status code del PHP
        return NextResponse.json(responsePHPData, { status: responsePHP.status });

    } catch (error: any) {
        console.error("Error en proxy /api/pagos/iniciar:", error);
        // Devolver un error genérico o el específico si lo capturamos bien
        const message = error.message.includes("módulo de pago PHP")
            ? error.message
            : 'Error interno del servidor al iniciar el pago.';
        return NextResponse.json({ success: false, message: message }, { status: 500 });
    }
}