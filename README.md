# Nexus Juvenil Luz y Paz
1. Abre `index.html` con doble clic: diseño, animaciones, NEXUS y la cruz funcionan sin internet de Supabase (las fuentes de Google y la librería necesitan internet).
2. Supabase (contador, HABLEMOS, galería, frases, panel): crea un proyecto, ejecuta `supabase/schema.sql`, y pega URL y clave *anon* en `config.js`.
   (el schema ya incluye 50 frases y versículos iniciales; edítalos desde el panel)
3. Crea tu usuario en Authentication > Users y ejecuta la línea final comentada de `schema.sql`. Entra por `admin.html`.
4. Tipografías oficiales: copia los archivos a `assets/fonts/` y descomenta `@font-face` en `style.css`.
5. Redes: edita los enlaces en `config.js` (el de Facebook es una búsqueda hasta que pongas la URL real).
Nunca pongas la clave `service_role` en estos archivos.

6. Tipografías: nombres exactos en `assets/fonts/`: Extenda, Breathing, Brice, Agrandir-Wide, Perandory, SloopScriptPro, Spiro, Avenir, Nectarine, TheSeasons, Genty (.woff2/.ttf/.otf). Sin ellos se usan respaldos de Google Fonts.
