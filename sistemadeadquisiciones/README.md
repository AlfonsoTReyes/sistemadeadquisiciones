# **SISTEMA DE ADQUISICIONES SAN JUAN DEL RÍO, QUERÉTARO**

## 📌 Descripción

Este sistema permite gestionar y controlar eficientemente el proceso de adquisiciones, compras y proveedores. Su objetivo es optimizar la administración de pedidos, garantizar transparencia en las adquisiciones y facilitar la trazabilidad de los recursos adquiridos.


## Tabla de contenidos
- [Requerimientos](#Requerimientos)
- [Instalación](#Instalación)
- [Visualización](#Visualización)
- [Prerrequisitos](#Prerrequisitos)
- [Estructura del Proyecto](#Estructura-del-Proyecto)
- [Despliegue en IIS](#Despliegue-en-IIS)
- [Autor](#Autor)

## Requerimientos

| Platform         | Language                   | IDE            |
|:---------------:|:-------------------------:|:-------------:|
| Next.js, Node.js, Tailwind, Pusher, Cloudinary | JavaScript, TypeScript, SQL (PostgreSQL) | VS Code, WebStorm |


## Instalación
Clona el repositorio

git clone https://github.com/presidenciaSJR/sistemadeadquisiciones.git
cd sistemadeadquisiciones


Luego en una terminal ejecutar:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y ve los resultados.

## Configuración del .env
Este sistema usa una base de datos relacional escrita en Postgrest. Para ello debes de contar con tu archivo .env en el cual se especifican las credenciales de base de datos. Se tiene dos opciones las cuales son:

**Pruba**
Las credenciales para la base de datos que se usa de prueba son las siguientes:
- Base de datos:
POSTGRES_URL=postgres://neondb_owner:npg_bRcE8rNok4aC@ep-falling-wave-a4jb2bl5-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_bRcE8rNok4aC@ep-falling-wave-a4jb2bl5.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-falling-wave-a4jb2bl5-pooler.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=npg_bRcE8rNok4aC
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_bRcE8rNok4aC@ep-falling-wave-a4jb2bl5-pooler.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_bRcE8rNok4aC@ep-falling-wave-a4jb2bl5-pooler.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=15&sslmode=require


**Producción**
Aun no se despliega en producción

## Visualización en local o prueba
Abre [http://localhost:3000](http://localhost:3000) en tu navegador y ve los resultados.

## Visualización en producción
Sistema no disponible aun
## Prerrequisitos 

Lista de software y herramientas, incluyendo versiones, que necesitas para instalar y ejecutar este proyecto:

- Sistema Operativo (Windows X versión)
- Lenguaje de programación (JavaScript, TypeScript, SQL)
- Framework (Next js)
- Base de datos (PostgreSQL 16)

## Estructura del Proyecto
Este proyecto sigue la arquitectura recomendada por Next.js, donde la página principal se encuentra en el archivo: `app/page.tsx`. 
Puedes comenzar a editar la página modificando este archivo. Los cambios se reflejarán automáticamente sin necesidad de recargar la página.

Además, este proyecto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para optimizar y cargar automáticamente la fuente [Geist](https://vercel.com/font), una nueva familia de fuentes diseñada por Vercel.



## 📖 Aprende Más sobre Next.js

Si deseas profundizar en el desarrollo con **Next.js**, te recomendamos revisar los siguientes recursos oficiales:

### 📚 **Documentación Oficial**
- 📖 [**Documentación de Next.js**](https://nextjs.org/docs) - Explora todas las características de Next.js, su API, la arquitectura recomendada y las mejores prácticas para el desarrollo de aplicaciones web.
- 🚀 [**Guía de Optimización**](https://nextjs.org/docs/advanced-features) - Aprende cómo optimizar el rendimiento de tu aplicación con características avanzadas como generación estática, SSR, ISR y más.

### 🏆 **Tutoriales y Aprendizaje Interactivo**
- 🎓 [**Aprende Next.js**](https://nextjs.org/learn) - Curso interactivo oficial donde puedes aprender los fundamentos de Next.js con ejemplos prácticos.
- 📺 [**Next.js en YouTube**](https://www.youtube.com/results?search_query=next.js) - Encuentra tutoriales en video sobre Next.js en diferentes niveles, desde básico hasta avanzado.

### 💻 **Código Fuente y Comunidad**
- 🛠 [**Repositorio de Next.js en GitHub**](https://github.com/vercel/next.js) - Accede al código fuente del framework, reporta problemas, contribuye con mejoras y revisa las últimas actualizaciones del proyecto.
- 👥 [**Comunidad de Next.js en Discord**](https://discord.com/invite/nextjs) - Únete a la comunidad oficial de Next.js para resolver dudas, compartir experiencias y obtener ayuda de otros desarrolladores.
- 🗣 [**Discusiones y Preguntas en GitHub**](https://github.com/vercel/next.js/discussions) - Un espacio donde puedes hacer preguntas, sugerir características o compartir tu experiencia con Next.js.

### 🏗 **Ejemplos y Recursos Adicionales**
- 📂 [**Ejemplos de Proyectos con Next.js**](https://github.com/vercel/next.js/tree/canary/examples) - Repositorio con múltiples ejemplos de cómo usar Next.js con diferentes tecnologías y configuraciones.
- 🔧 [**Plantillas de Next.js en Vercel**](https://vercel.com/templates) - Descubre plantillas listas para usar en Vercel con Next.js, Tailwind CSS, TypeScript y más.

¡Explora estos recursos y lleva tu conocimiento de **Next.js** al siguiente nivel! 🚀🔥


## Despliegue en IIS

Instrucciones sobre cómo desplegar esto en un sistema en vivo o ambiente de producción se encuentran citadas en el siguiente enlace:  
👉 [Guía de Despliegue en IIS](https://drive.google.com/file/d/1vEip6u0RZWyjAW57YygvVPkv1jnrzDzU/view?usp=sharing)



## Autor
Evelyn Hernández Martínez.