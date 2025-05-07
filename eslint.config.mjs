// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Podrías necesitar importar el plugin de TypeScript si las reglas no se aplican correctamente,
// aunque next/typescript debería manejarlo. Si da error de que no conoce la regla, descomenta:
// import tsPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
<<<<<<< HEAD
  ...compat.extends("next/core-web-vitals", "next/typescript"), // Tus configuraciones base

  // Nuevo objeto de configuración para personalizar reglas
  {
    // Opcional: puedes especificar a qué archivos aplicar estas reglas.
    // Si no se especifica, se aplica globalmente (después de las extendidas).
    // files: ["**/*.ts", "**/*.tsx"], // Descomenta si quieres ser específico

    // plugins: { // Descomenta y usa si es necesario (ver nota arriba)
    //   '@typescript-eslint': tsPlugin,
    // },

    rules: {
      // Para variables no utilizadas:
      '@typescript-eslint/no-unused-vars': ['warn', { // Cambiado de 'error' a 'warn'
        argsIgnorePattern: '^_',          // Ignorar argumentos de función que comiencen con _
        varsIgnorePattern: '^_',          // Ignorar variables que comiencen con _
        caughtErrorsIgnorePattern: '^_',  // Ignorar errores capturados que comiencen con _
      }],

      // Para el uso explícito de 'any':
      '@typescript-eslint/no-explicit-any': 'warn', // Cambiado de 'error' a 'warn'

      // Si tienes otros errores específicos que quieras modificar, añádelos aquí.
      // Por ejemplo, si tuvieras una regla como 'no-console':
      // 'no-console': 'warn', // Permitir console.log pero con advertencia

      // IMPORTANTE: Las reglas de hooks como 'react-hooks/rules-of-hooks'
      // generalmente se dejan como 'error' porque indican problemas fundamentales.
      // 'react-hooks/rules-of-hooks': 'error', (ya debería estar así por next/core-web-vitals)
      // 'react-hooks/exhaustive-deps': 'warn', (ya debería estar así por next/core-web-vitals)
    }
  }
];

export default eslintConfig;