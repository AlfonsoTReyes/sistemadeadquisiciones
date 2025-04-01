// Importaciones necesarias para Next.js y funciones del servicio.
import { NextRequest, NextResponse } from 'next/server';
import { getProveedorById, updateProveedorCompleto } from '../../../services/proveedoresservice';
import { getProveedorById, updateProveedorCompleto } from '../../../services/proveedoresservice';


export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id_proveedor');
  
      if (!id) {
        return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
      }
  
      const proveedor = await getProveedorById(parseInt(id));
  
      if (!proveedor) {
        return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
      }
  
      return NextResponse.json(proveedor);
    } catch (error) {
      return NextResponse.json({ message: 'Error al obtener proveedor', error }, { status: 500 });
    }
  }

  // Actualizar proveedor completo
export async function PUT(req: NextRequest) {
    try {
      const {
        id_proveedor,
        razon_social,
        nombre_representante,
        apellido_p_representante,
        apellido_m_representante,
        rfc,
        giro_comercial
      } = await req.json();
  
      if (!id_proveedor) {
        return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
      }
  
      const proveedorActualizado = await updateProveedorCompleto(id_proveedor, {
        razon_social,
        nombre_representante,
        apellido_p_representante,
        apellido_m_representante,
        rfc,
        giro_comercial
      });
  
      return NextResponse.json(proveedorActualizado);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
/*
export async function PUT(req: NextRequest) {
  try {
    const { id_proveedor, nombre, calle, numero, colonia, municipio, estado, codigo_postal, rfc, giro_comercial, numero_registro_imss, correo, telefono_uno, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, estatus, emailUsuario } = await req.json();

    if (!id_proveedor) {
      return NextResponse.json({ message: 'ID del proveedor no proporcionado' }, { status: 400 });
    }

    const proveedorActualizado = await updateProveedorStatus(id_proveedor, {
      nombre,
      calle,
      numero,
      colonia,
      municipio,
      estado,
      codigo_postal,
      rfc,
      giro_comercial,
      numero_registro_imss,
      correo,
      telefono_uno,
      telefono_dos,
      pagina_web,
      camara_comercial,
      numero_registro_camara,
      estatus,
      emailUsuario
    });

    if (!proveedorActualizado) {
      return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(proveedorActualizado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al actualizar proveedor', error }, { status: 500 });
  }
}
  */