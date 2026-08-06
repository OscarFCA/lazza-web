# Sitio de Lazza Arquitectura

Sitio estático del despacho de arquitectura residencial Lazza Arquitectura, dirigido por el arquitecto Jaime Lavín Zavala desde 1997.

Sustituye al portafolio actual de Squarespace, que no tiene punto de conversión. Este sí: una sola conversión declarada por página, formulario propio, y contenido preparado para búsqueda tradicional y para motores de respuesta con IA.

**Vista previa:** https://oscarfca.github.io/lazza-web/
**Producción prevista:** https://lazza.com.mx (todavía en Squarespace)

Preparado por BubbleMesh.

---

## Estado

Esta es una implementación completa lista para revisión, **no un sitio publicable todavía**. Ver "Bloqueadores" más abajo.

- 34 páginas construidas, 871 enlaces internos verificados sin roturas.
- Cerrado a buscadores a propósito, ver "Indexación".
- Sin fotografía real: cada imagen es un marcador etiquetado con lo que va ahí.

## Stack

HTML y CSS estáticos, sin build, sin dependencias, sin framework. La razón es la de siempre en este despacho: quién lo va a operar cuando BubbleMesh no esté en el día a día. Un sitio que se edita abriendo un archivo se puede mantener; uno que exige `npm install` para cambiar un párrafo, no.

- Un solo CSS con los tokens de marca en `:root`.
- Un solo JS, sin librerías: menú de móvil, medición y validación del formulario. Si el JS falla, la página sigue funcionando.
- Fuentes desde Google Fonts. Autoalojarlas es una mejora pendiente de rendimiento y privacidad.

## Estructura

```
├── index.html                  Home
├── obras/                      Landing + 8 obras construidas
├── proyectos/                  Landing + 11 proyectos diseñados
├── studio/                     El despacho
│   ├── jaime-lavin/            Página de autor, el ancla de E-E-A-T
│   └── verticales/             Oficinas, restaurantes, salud
├── blog/                       Índice + primer artículo en borrador
├── premios/                    Reconocimientos con su evidencia
├── contacto/                   La conversión del sitio
├── gracias/                    Para que la conversión sea contable
├── newsletter/                 Landing de suscripción
├── preguntas-frecuentes/       FAQ, la pieza de AEO más valiosa
├── aviso-de-privacidad/        Obligatorio por la LFPDPPP
├── 404.html
├── robots.txt · sitemap.xml · llms.txt
└── assets/  css · js · img
```

**Las rutas son relativas a propósito.** Ninguna empieza con `/`, para que el sitio funcione igual en un subdirectorio de GitHub Pages que en un dominio propio, sin tocar una línea. La única excepción es `404.html`, que usa rutas absolutas porque GitHub Pages lo sirve desde cualquier profundidad; está comentado en el archivo.

## Indexación

**El sitio está cerrado a buscadores.** `robots.txt` bloquea todo y cada página lleva `noindex, nofollow`.

Es deliberado: mientras lazza.com.mx siga vivo, abrir este a indexación crearía dos sitios del mismo despacho compitiendo entre sí, que es lo que más daña el posicionamiento del cliente.

Para abrirlo el día de la migración, los pasos están escritos en `robots.txt`. `/gracias/` y `404.html` se quedan en `noindex` para siempre.

## SEO y AEO

- HTML semántico, un solo `h1` por página, jerarquía real de encabezados, `section` con `aria-labelledby`.
- URL limpias en español.
- JSON-LD con grafo de entidades: `Organization` y `ProfessionalService` con `@id` estable, `Person` para Jaime referenciado por `@id` desde cada página, `CreativeWork` en obras y proyectos, `Article` en el blog, `FAQPage` en preguntas frecuentes, `CollectionPage` con `ItemList` en las landings.
- `llms.txt` declara qué es el despacho, qué reconocimientos tiene y, sobre todo, **qué no afirma este sitio**. Esa sección existe para que un motor de respuesta no herede afirmaciones sin confirmar que circulan en perfiles de terceros.
- `areaServed` solo incluye Estado de México. No incluye Estados Unidos.

## Contenido

Todo el texto sale de los documentos de contenido aprobados en `../Contenido/`, que a su vez obedecen `Criterios-de-contenido.md`. El HTML no inventa copy.

Donde el copy tenía varias opciones, se implementó la A y las demás quedaron en comentarios HTML, listas para que Jaime elija sin volver a maquetar.

**Reglas duras que el sitio respeta y conviene no romper por descuido:**

- Nunca se publica: nombre de cliente, ubicación de obra, metros cuadrados, costo, plazo, garantía, planos, ni presencia fuera de México.
- La antigüedad se escribe siempre "desde 1997", nunca en número de años.
- Cero rayas largas, cero signos de exclamación, cero superlativos, y la palabra "lujo" está prohibida salvo en la pregunta literal de la FAQ, donde es la duda del visitante y se responde con la distinción entre costoso y caro.
- Los títulos de contenido van en minúsculas: descienden de la firma manuscrita de la marca.
- Nueve reconocimientos están redactados pero **bloqueados en comentarios HTML** hasta que se resuelva su atribución. No se descomentan sin esa decisión.

## Bloqueadores de publicación

No son técnicos, pero impiden lanzar:

1. **Correo de dominio propio.** Hoy el contacto público es Gmail. El formulario no se publica contra un Gmail.
2. **Destino del formulario.** No está conectado: `action` apunta a `/gracias/` como marcador.
3. **Aviso de privacidad revisado legalmente.** Sin él no puede existir el formulario ni la casilla de newsletter. El texto está redactado, no revisado.
4. **Fotografía.** No hay ni una imagen real. Cada marcador dice qué fotografía va ahí.
5. **Responsable de producción del blog.** Sin nombre, no sale el primer artículo.

## Cómo trabajar en él

Abrir cualquier `.html` en el navegador. No hay servidor, no hay build, no hay instalación.

Para revisar el sitio completo con rutas limpias:

```bash
python3 -m http.server 8000
```

y abrir http://localhost:8000

## Publicación

GitHub Pages desde la rama `main`, carpeta raíz. El archivo `.nojekyll` evita que Jekyll procese el sitio.
