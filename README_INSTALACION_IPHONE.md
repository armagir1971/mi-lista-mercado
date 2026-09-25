# Mi Lista de Mercado V3 — PWA

Versión gratuita para iPhone, sin Mac, sin Xcode y sin App Store.

## Funciones
- Productos, cantidades y precios.
- Formato de precios colombiano: 12.990 / 12.990,50 / 12,99.
- Total, presupuesto y dinero restante.
- Marcar productos comprados.
- Categorías y supermercado.
- Foto del producto.
- Catálogo local por código de barras.
- Historial básico de precio en el catálogo.
- Compartir la lista.
- Exportar/importar respaldo JSON.
- Modo sencillo.
- Persistencia local y funcionamiento offline después de cargar la aplicación y registrar el Service Worker.
- Sin librerías externas ni llamadas obligatorias a servidores.

## Instalación gratuita en iPhone
1. Crea una cuenta gratuita en GitHub desde Safari si no tienes una.
2. Crea un repositorio nuevo, por ejemplo `mi-lista-mercado`.
3. Sube estos archivos al repositorio:
   - index.html
   - styles.css
   - app.js
   - manifest.webmanifest
   - sw.js
   - icon-192.svg
   - icon-512.svg
4. En GitHub abre Settings > Pages.
5. Selecciona publicar desde la rama `main` y carpeta `/root`.
6. Espera a que GitHub Pages publique el sitio.
7. Abre la dirección HTTPS de Pages en Safari.
8. Pulsa Compartir → Añadir a pantalla de inicio → Añadir.
9. Abre "Mi Lista de Mercado" desde el icono de la pantalla de inicio.

IMPORTANTE: abrir el ZIP desde Archivos no convierte por sí solo la aplicación en una PWA. Para instalación como PWA y para que el Service Worker pueda funcionar, la aplicación debe servirse desde HTTPS.

## Privacidad
Los productos, presupuesto y catálogo se guardan en el almacenamiento del navegador de ese iPhone. La aplicación no contiene un servidor propio.

## Limitaciones conocidas
- El escaneo universal de códigos de barras con cámara no se fuerza porque el soporte de APIs de cámara/barcode puede variar entre versiones de iOS/Safari. Siempre queda disponible la entrada manual.
- Reconocimiento de voz no se incluye como dependencia obligatoria porque Web Speech puede variar según navegador/idioma/permisos.
- Esta versión no sincroniza automáticamente entre varios teléfonos.
