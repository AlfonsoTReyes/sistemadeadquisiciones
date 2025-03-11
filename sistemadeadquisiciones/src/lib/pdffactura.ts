import cloudinary from 'cloudinary';
import { Readable } from 'stream';

// configuración de cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// definir la interfaz para la respuesta de la subida a cloudinary
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  asset_id: string;  
}

// función para subir un pdf a cloudinary de forma privada
export const subirPdfCloudinary = (
  pdfBuffer: ArrayBuffer,
  facturaData: any,
  anio: any,
  facturaId: any
): Promise<CloudinaryUploadResponse> => {
  const folderPath = `nominas/${anio}/${facturaId}`;
  const publicId = `${folderPath}/${facturaData.TrabajadorID.replace(/\s+/g, '')}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { 
        folder: folderPath, 
        public_id: publicId,
        resource_type: 'raw',  // asegurar que es un documento pdf
        type: 'authenticated', // restringe acceso público
      },
      (error, result) => {
        if (error) {
          console.error('error al subir el pdf a cloudinary:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('error desconocido al subir el archivo'));
        }
        // incluir asset_id en la respuesta
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          asset_id: result.asset_id,
        });
      }
    );

    // convertir el arraybuffer a un stream y subirlo
    const readableStream = new Readable();
    readableStream.push(Buffer.from(pdfBuffer));
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};
