<h1 align="center">ReCapture</h1>
<h3 align="center">Un visor de requests liviano que corre en el navegador y permite interceptar y mostrar solicitudes fetch/XHR en tiempo real. Incluye filtros, UI en vivo, parsing de POST, exportación a JSON, copiado automático y un panel flotante tipo DevTools. Solo pegalo en DevTools y empezá a capturar.</h3>

<p align="center">
  🇺🇸 <a href="README.md">English</a> |
  🇪🇸 <a href="README_ES.md"><b>Español</b></a>
</p>

---

## 📋 INICIO RÁPIDO
Podés copiar **ReCapture.js** y pegarlo directamente en DevTools (F12 > Console > Ctrl + V) **O** crear un script persistente que puedas activar/desactivar cuando quieras, **SIN** tener que volver a este horrible repo cada vez para copiar el script.

Para esa última opción, podés usar **TAMPERMONKEY**:

1. **Copiá el script** de arriba
2. **Abrí Tampermonkey** en tu navegador
3. **Creá un nuevo script** (botón `+`)
4. **Pegá el código**
5. **Guardá** (Ctrl+S)
6. **Activá el script**
7. **Recargá cualquier página** (F5)
8. **¡Listo!** La UI aparece automáticamente

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### Paso a paso:

**1. Instalá la extensión Tampermonkey:**
- Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/

**2. Crear nuevo script:**
- Hacé clic en el ícono de Tampermonkey
- Seleccioná "Create a new script"
- Borrá todo el código existente

**3. Pegá este script:**
```javascript
// ==UserScript==
// @name         ReCapture
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Capture and analyze HTTP requests in real-time
// @author       URDev
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// PEGÁ ACÁ TODO EL SCRIPT DE ARRIBA
// (Desde (function() { hasta })();)
````

**4. Guardar y habilitar:**

* Presioná `Ctrl+S`
* Asegurate de que el script esté habilitado (switch en ON)
* Recargá cualquier página web

## 🎯 CÓMO USARLO

**Una vez instalado:**

1. **Visitá cualquier sitio web**
2. **Aparece el panel de UI** (esquina superior derecha)

<img width="230" height="276" alt="recapture ui new" src="https://github.com/user-attachments/assets/5afcae97-e25d-4fe8-9692-0578d9a7898e" />

*(podés minimizar la UI si lo necesitás)*

<img width="127" height="54" alt="image (29)" src="https://github.com/user-attachments/assets/6b0feb9d-899a-4b07-8d87-94cc1ec7acbc" />

Vas a poder ver desde la ventana minimizada cuándo aparecen nuevos requests.

3. **Interactuá con la página** – los requests se capturan automáticamente

<img width="420" height="530" alt="request capuring new" src="https://github.com/user-attachments/assets/84efe6e6-bc51-40bb-af01-06bda1b4adc9" />

4. **Usá los botones** del panel para:

   * Mostrar todas las capturas
   * Mostrar solo requests POST
   * Exportar a JSON
   * Copiar al portapapeles
   * Filtrar resultados

**Comandos de consola:**

```javascript
captureCommands.showAll()         - Mostrar todas las capturas
captureCommands.showPost()        - Mostrar solo POST
captureCommands.clear()           - Borrar capturas
captureCommands.export()          - Exportar a archivo JSON
captureCommands.copy()            - Copiar al portapapeles
captureCommands.toggle()          - Activar/desactivar captura
captureCommands.find("texto")     - Buscar capturas
captureCommands.getLast(5)        - Obtener las últimas 5
captureCommands.getPostCaptures() - Obtener todos los POST
```

<img width="273" height="303" alt="recapture console" src="https://github.com/user-attachments/assets/22238a3c-8009-4199-a90c-f986a49019dc" />

## ⚙️ CONFIGURACIÓN

Editá estas variables dentro del script:

```javascript
const CONFIG = {
    captureAll: true,
    showInRealTime: true,
    maxCaptures: 100,
    filterMethods: ['POST'],
    filterUrls: [],
    excludeUrls: [],
    includeHeaders: true,
    includeBody: true,
    includeResponse: false,
    autoCopy: false,
    saveToFile: false
};
```

## 🛠️ SOLUCIÓN DE PROBLEMAS

**Problema: la UI no aparece**

* Verificá que Tampermonkey esté habilitado
* Revisá que el script esté activo
* Recargá la página (F5)
* Mirá la consola del navegador (F12 → Console)

**Problema: no captura requests**

* Revisá `CONFIG.filterMethods`
* Algunos sitios usan WebSockets (no se capturan)
* Asegurate de interactuar luego de que la página cargue

**Problema: conflictos**

* Desactivá otros userscripts
* Probá sin adblock
* Usá modo incógnito

**Problema: rendimiento/memoria**

* Bajá `maxCaptures`
* Desactivá `includeResponse`
* Usá el botón "Clear" seguido

## 📁 EXPORTAR DATOS

**Guardar capturas:**

1. Click en **Export JSON**
2. Se descarga `request-captures-[timestamp].json`
3. Abrilo con editor de texto, visor JSON o herramientas de análisis

**Copiar requests:**

* `captureCommands.getLast(1)`
* `captureCommands.find("texto")`
* Botón **Copy All** en la UI

*(estructura JSON igual a la original)*

## 🔄 ACTUALIZAR SCRIPT

**Actualizar:**

1. Abrí Tampermonkey
2. Buscá "ReCapture"
3. Editá
4. Pegá el nuevo código
5. Guardá
6. Recargá páginas

**Desactivar temporalmente:**

* Toggle OFF / ON desde Tampermonkey
  *(ideal para tenerlo siempre guardado)*

## ⚡ CONSEJOS PRO

* Cada pestaña captura de forma independiente
* No envía datos a ningún servidor
* Podés filtrar dominios específicos
* Ideal para debugging rápido

## 🚫 LIMITACIONES

* No captura WebSockets
* Puede fallar en sitios muy protegidos
* Requiere recarga
* Responses grandes afectan rendimiento

## 📞 SOPORTE

* F5 soluciona el 98% de los problemas
* Revisá la consola
* Reiniciá el navegador si hace falta

Con <3 por URDev, ¡para VOS!
