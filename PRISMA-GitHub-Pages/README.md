# PRISMA WEB — GitHub Pages

Sitio web informativo estático de PRISMA. La aplicación LESCO es un proyecto independiente.

## Publicar en GitHub Pages

1. Descomprima este ZIP. Suba **el contenido de la carpeta `PRISMA`** a la raíz de la rama principal del repositorio (no suba otra carpeta `PRISMA/` ni el archivo ZIP como único archivo).
2. Compruebe que `index.html`, `nosotros.html`, `css/`, `js/`, `images/` y `.nojekyll` estén en la **raíz del repositorio**.
3. GitHub → Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main` (o la rama usada) → Folder: **/(root)** → Save.
4. Visite la dirección mostrada por GitHub Pages cuando el despliegue termine. En un repositorio de proyecto será `https://USUARIO.github.io/REPOSITORIO/`; en un repositorio `USUARIO.github.io` será `https://USUARIO.github.io/`.

El sitio usa enlaces relativos y conserva el diseño. No se requiere Python, Node, Flask ni un proceso de compilación.

## Ejecutar localmente

Desde el directorio que contiene `index.html`:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000`.

## Limitaciones del alojamiento

GitHub Pages es un servicio estático. No ejecuta backend, correo transaccional ni reglas personalizadas de encabezados HTTP. Los mensajes por `mailto:` y enlaces a WhatsApp dependen de las aplicaciones del visitante. Si se necesita una CSP u otros encabezados a nivel servidor, utilice un proveedor que los permita o un proxy compatible. El archivo `_headers` se retiró del paquete de GitHub Pages para evitar sugerir falsamente que está activo.

El sitemap y las URLs canónicas requieren el dominio/repositorio real. No se inventaron direcciones. La documentación técnica ampliada se retiró de este paquete para no exponerla como páginas públicas.
