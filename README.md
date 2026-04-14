PathFinderAI

Generador Inteligente de Rutas de Aprendizaje

CICLO FORMATIVO DE GRADO SUPERIOR

Desarrollo de Aplicaciones Web

I.E.S. «Venancio Blanco» SALAMANCA

AUTOR

Adrián Gómez Izquierdo

Licencia

Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/ o envíe una carta a Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.

# Índice de contenido

Índice de figuras

Ilustración 1 - Comparación Competencia ChatGPT	11

Ilustración 2 - Comparación Competencia roadmap.sh	12

Ilustración 3 - Diagrama Casos de Uso	23

Ilustración 4 - Estructura de Carpetas del Proyecto	47

Ilustración 5 - Estructura JSON Mapa de Aprendizaje para React Flow	49

Ilustración 6 - Estructura JSON de datos devueltos por Supabase	51

Ilustración 7 - Modelo Entidad-Relacion	53

Ilustración 8 - Modelo Relacional	53

Ilustración 9 - Diagrama de Clases	54

Ilustración 10 - Wireframe	55

Ilustración 11 - Mockup (Diseño Final)	56

Ilustración 12 - Paleta de Colores	59

Ilustración 13 - Diagrama Gantt	62

Ilustración 14 - Planificación del Proyecto	64

# Índice de tablas

Tabla 1 - Ventajas PathFinderAI	13

Tabla 2 - Costes Económicos Escalabilidad	14

Tabla 3 - Objetivo Funcional 1	15

Tabla 4 - Objetivo Funcional 2	16

Tabla 5 - Objetivo Funcional 3	17

Tabla 6 - Objetivo Funcional 4	17

Tabla 7 - Objetivo Funcional 5	18

Tabla 8 - Objetivo Funcional 6	18

Tabla 9 - Objetivo Funcional 7	19

Tabla 10 - Objetivo Funcional 8	19

Tabla 11 - Objetivo Funcional 9	20

Tabla 12 - Objetivo Funcional 10	20

Tabla 13 - Objetivo Funcional 11	21

Tabla 14 - Definición de Actores	22

Tabla 15 - Caso de Uso UC-01	24

Tabla 16 -  Caso de Uso UC-02	25

Tabla 17 -  Caso de Uso UC-03	26

Tabla 18 -  Caso de Uso UC-04	27

Tabla 19 -  Caso de Uso UC-05	28

Tabla 20 -  Caso de Uso UC-06	29

Tabla 21 -  Caso de Uso UC-07	30

Tabla 22 -  Caso de Uso UC-08	31

Tabla 23 - Caso de Uso UC-09	32

Tabla 24 - Caso de Uso UC-10	33

Tabla 25 - Caso de Uso UC-11	34

Tabla 26 - Caso de Uso UC-12	35

Tabla 27 - Caso de Uso UC-13	36

Tabla 28 - Caso de Uso UC-14	37

Tabla 29 - Requisitos Funcionales	39

Tabla 30 - Requisitos No Funcionales	40

Tabla 31 - Requisito Información 1	40

Tabla 32 - Requisito Información 2	41

Tabla 33 - Requisito Información 3	41

Tabla 34 - Licencias Software	43

Tabla 35 - Desglose Diagrama Gantt	63

Estudio del problema y análisis del sistema

Introducción

Memoria Inicial

El proyecto PathFinderAI consiste en el desarrollo de una aplicación web para la generación automática de itinerarios educativos empleando la Inteligencia Artificial para transformar la consulta introducida por el usuario en una estructura lógica y organizada de aprendizaje. Mediante la integración de la Application Programming Interface (API) de Gemini, se procesan las solicitudes y genera un JavaScript Object Notation (JSON) que definirá la estructura completa del mapa.

La herramienta surge para resolver la fragmentación de la información en la red, ofreciendo un Minimum Viable Product (MVP) que entrega contenido y visualiza las dependencias entre distintos conceptos del tema solicitado. El objetivo es proporcionar una experiencia fluida donde la tecnología actúe como un profesor que te enseña por dónde empezar a aprender algo.

Justificación de la idea

Se justifica la creación de esta aplicación por la inexistencia de herramientas que generen hojas de rutas personalizadas universales. Con esto evitaremos que el estudiante un tiempo excesivo en investigar los conceptos a aprender entre temas. Y que la tarea de estudiar sea más rápida, atractiva y productiva para aquellos estudiantes autodidactas o alumnos que necesitan estudiar para un examen.

Resolución de Problemas

Ahorro de tiempo: Se elimina la fase de búsqueda previa donde el alumno debe elegir el orden de que concepto estudiar primero.

Filtración automática: La herramienta actúa como un filtro de calidad que solo selecciona los conceptos necesarios.

Estructura lógica: Los temas seguirán un orden claro y coherente, evitando que el usuario aprenda conceptos avanzados sin antes tener las bases necesarias.

Necesidad y Oportunidad

El proyecto existe por la demanda de interfaces intuitivas y fáciles en el sector educativo que prioricen la visualización del contenido, integrando servicios de Backend as a Service (BaaS) como Supabase ofreciendo una plataforma segura para el almacenamiento de los datos. Permitiendo al usuario mantener un registro de sus progresos en la nube.

Se observa un crecimiento en el uso de la IA en el sector del Desarrollo de Aplicaciones Web. Las soluciones actuales se suelen limitar a la entrega de texto plano sin una estructura visual navegable. Y otras plataformas pueden ofrecer rutas de calidad están limitadas a temas tecnológicos predefinidos sin la capacidad de adaptación universal.

Motivación

La motivación principal de desarrollar esta aplicación web es tener una aplicación que te 	ayude a aprender sobre un tema ofreciéndote las dependencias para poder especializarte 	en ese tema. Además, utilizar PathFinderAI ahorrará mucho tiempo de búsqueda por la 	red, ya que esta aplicación mostrará las dependencias necesarias para el 	aprendizaje del tema y recursos para aprender cada concepto, teniendo todo centralizado 	en una sola aplicación.

Por último, esto se combina con el deseo de ofrecer una solución real al mundo educativo 	y simplificar la adquisición de nuevas competencias mediante una representación visual	clara que facilite la retención de conceptos y motivando a más personas a iniciar estudios 	por cuenta propia al ver el “mapa completo” de lo que necesitan aprender.

Análisis de Competencia

ChatGPT (OpenAI) – El Generador Textual

ChatGPT es capaz de generar itinerarios de estudio muy completos, pero su limitación es puramente visual y funcional.

Ilustración 1 - Comparación Competencia ChatGPT

Análisis Visual: La interfaz es un chat lineal, El “roadmap” se entrega como una lista de texto o Markdown.

Limitación: EL usuario debe copiar y pegar texto en otra herramienta para organizarse. No hay una representación jerárquica clara ni interactividad con los conceptos.

2. Roadmap.sh – El estándar Estático

Es la plataforma líder en hojas de ruta para desarrolladores.

Ilustración 2 - Comparación Competencia roadmap.sh

Análisis Visual: Ofrece mapas de nodos muy estéticos y profesionales, con una jerarquía clara y recursos asociados.

Limitación: Son mapas estáticos y predefinidos. Si quieres aprender algo que no esté en su catálogo (ej. “Historia del Arte” o “Cocina Molecular”), la herramienta no sirve. No utiliza IA para personalizar la ruta del usuario.

3. Tabla Comparativa: Ventajas de PathFinderAI

| Característica | ChatGPT | Roadmap.sh | PathFinderAI |
| --- | --- | --- | --- |
| Generación por IA | Sí | No (Curados a mano) | Sí (Gemini API) |
| Visualización Gráfica | No (Texto plano) | Sí (Mapas fijos) | Sí (Canvas Interactivo) |
| Universalidad de Temas | Alta | Baja (Solo Tecnología) | Total (Cualquier tema) |
| Seguimiento de Progreso | No | Limitado | Sí (Base de datos propia) |
| Interactividad (Zoom / Drag) | No | No | Sí (React Flow) |
| Persistencia Personal | No (Solo historial del chat) | No | Sí (Perfil con Supabase) |

Tabla  - Ventajas PathFinderAI

Viabilidad

La viabilidad técnica se basa en el uso de tecnologías de alto rendimiento. El uso de React y Node.js permite gestionar las peticiones a la API eficientemente. Y se garantiza la seguridad mediante un servidor proxy que protege las claves de acceso y evita el uso no autorizado de los recursos.

Desde la perspectiva económica, el proyecto carece de riesgos financieros al emplear servicios gratuitos en la nube y se estima un esfuerzo de desarrollo de 350 horas. Se utilizan plataformas como Vercel para el despliegue y Supabase para la gestión de la base de datos relacional. Esta estrategia permite mantener el sistema y la autenticación sin costes de mantenimiento durante las fases de desarrollo y presentación del proyecto.

Aunque actualmente se operará bajo capas gratuitas, se prevén los siguientes costes de escalabilidad:

| Recurso | Explicación | Precio |
| --- | --- | --- |
| Gemini API | Gratuito hasta 15 peticiones por minuto | 0.000125$ por 1000 tokens |
| Supabase | El plan gratuito cubre hasta 500MB de base de datos. | El salto al plan “Pro” sería de 25$/mes si se supera el almacenamiento de rutas generadas. |

Tabla  - Costes Económicos Escalabilidad

Definición del Sistema

Objetivos del Proyecto

2.1.1 Objetivos Funcionales

| Detalles | OBJ-01: Acceso | OBJ-01: Acceso |
| --- | --- | --- |
| ID | OBJ-01 | Módulo |
| Acceso | Objetivo Funcional | Gestión de Identidad |
| Descripción | Sistema de registro y acceso seguro mediante Supabase. | Justificación SMART |
| S: Registro e inicio de sesión. M: Tasa de éxito del 100% en la creación de perfiles. A: Vía Supabase Auth. R: Seguridad del perfil. T: Fase 2 (Semana 6) | Prioridad | Alta |
|  |
|  |

Tabla  - Objetivo Funcional 1

| Detalles | OBJ-02: Motor IA |
| --- | --- |
| ID | OBJ-02 |
| Módulo | Motor IA |
| Objetivo Funcional | Generación Universal |
| Descripción | Implementar un sistema de Prompt Engineering para generar estructuras JSON compatibles con la visualización de grafos en React Flow. |
| Justificación SMART | S: Transformación de entradas de usuario en esquemas lógicos procesables por el frontend. M: El tiempo de respuesta de la API no debe exceder los 5 segundos A: Uso de Gemini API R: Función núcleo T: Fase 3 (Semana 9) |
| Prioridad | Alta |

Tabla  - Objetivo Funcional 2

| Detalles | OBJ-03: Interfaz |
| --- | --- |
| ID | OBJ-03 |
| Módulo | Interfaz |
| Objetivo Funcional | Renderizado de Mapa |
| Descripción | Ruta educativa como un gráfico interactivo. |
| Justificación SMART | S: Visualización nodos y enlaces M: El sistema debe renderizar el 100% de los nodos recibidos en el JSON A: Integración con React. R: Valor visual del Minimum Viable Product (MVP) T: Fase 4 (Semana 11) |
| Prioridad | Alta |

Tabla  - Objetivo Funcional 3

| Detalles | OBJ-04: Contenido |
| --- | --- |
| ID | OBJ-04 |
| Módulo | Contenido |
| Objetivo Funcional | Consulta de Detalles |
| Descripción | Desplegar ventanas que muestren descripción y recursos del módulo seleccionado. |
| Justificación SMART | S:  Apertura de modal con datos. M: Tiempo de despliegue inferior a 200 milisegundos tras el clic. A: Componentes de React R: Utilidad pedagógica T: Fase 4 (Semana 8) |
| Prioridad | Alta |

Tabla  - Objetivo Funcional 4

| Detalles | OBJ-05: Persistencia |
| --- | --- |
| ID | OBJ-05 |
| Módulo | Persistencia |
| Objetivo Funcional | Historial de Rutas |
| Descripción | Almacenar y recuperar la ruta generada. |
| Justificación SMART | S: Guardado de ruta por usuario. M: Integridad del 100% de los datos en campos JSONB. A: Consultas SQL. R: Continuidad de estudio. T: Fase 4 (Semana 8) |
| Prioridad | Media |

Tabla  - Objetivo Funcional 5

| Detalles | OBJ-06: Navegación |
| --- | --- |
| ID | OBJ-06 |
| Módulo | Navegación |
| Objetivo Funcional | Control de Navegación |
| Descripción | Herramientas para la interacción con el mapa |
| Justificación SMART | S: Manipulación física del grafo. M: Movimiento fluido del mapa. A: Funciones de React Flow R: Experiencia de usuario. T: Fase 2 (Semana 8) |
| Prioridad | Media |

Tabla  - Objetivo Funcional 6

| Detalles | OBJ-07: Progreso |
| --- | --- |
| ID | OBJ-07 |
| Módulo | Progreso |
| Objetivo Funcional | Seguimiento de Avance |
| Descripción | Permitir marcación de temas completados. |
| Justificación SMART | S: Cambio de estado de nodos. M: Persistencia del estado tras recargar la página en menos de 1 segundo. A: Gestión de estado en React. R: Motivación del estudiante. T: Fase 5 (Semana 15) |
| Prioridad | Media |

Tabla  - Objetivo Funcional 7

| Detalles | OBJ-08: Administrador |
| --- | --- |
| ID | OBJ-08 |
| Módulo | Administrador |
| Objetivo Funcional | Análisis de Uso |
| Descripción | Panel de control para visualizar métricas de uso (usuarios, rutas, temas más consultados) |
| Justificación SMART | S:  Centralización de estadísticas de tracción. M: El sistema debe registrar el 100% de las nuevas rutas y usuarios. A: Vía Dashboard de administración. R: Toma de decisiones informada. T: Fase 5 (Semana 16) |
| Prioridad | Baja |

Tabla  - Objetivo Funcional 8

| Detalles | OBJ-09: Historial |
| --- | --- |
| ID | OBJ-09 |
| Módulo | Historial |
| Objetivo Funcional | Mantenimiento de Información |
| Descripción | Permitir al usuario la eliminación de mapas de aprendizaje de su historial para optimizar su espacio personal. |
| Justificación SMART | S: Borrado persistente de rutas seleccionadas. M: Tasa de éxito del 100% en la eliminación de datos. A:  Interfaz de gestión de historial. R: Organización del contenido. T: Fase 4 (Semana 11) |
| Prioridad | Media |

Tabla  - Objetivo Funcional 9

| Detalles | OBJ-10: Gestión de Perfil |
| --- | --- |
| ID | OBJ-10 |
| Módulo | Gestión de Perfil |
| Objetivo Funcional | Personalización de Cuenta |
| Descripción | Ofrecer herramientas para la actualización de la información personal y las preferencias de aprendizaje del usuario. |
| Justificación SMART | S:  Modificación de datos básicos de cuenta. M: Validación del 100% de los datos introducidos. A:  Formularios de configuración de perfil. R: Integridad de la cuenta. T: Fase 4 (Semana 11) |
| Prioridad | Media |

Tabla  - Objetivo Funcional 10

| Detalles | OBJ-11: Logout | OBJ-11: Logout |
| --- | --- | --- |
| ID | OBJ-11 | Módulo |
| Logout | Objetivo Funcional | Cierre de Sesión |
| Descripción | Permitir al usuario finalizar su sesión activa de forma segura para proteger su cuenta y privacidad. | Justificación SMART |
| S:  Implementar la función de “Cerrar Sesión” utilizando el sistema de autenticación de Supabase. M: Comprobable mediante estado de sesión null y redirección en <500ms. A:  Integración sencilla mediante la librería cliente de Supabase en el frontend. R: Esencial para la seguridad del usuario, especialmente en dispositivos compartidos. T: Fase 2 (Semana 6) | Prioridad | Alta |
|  |
|  |

Tabla  - Objetivo Funcional 11

Definición de Actores

| ID | Actor | Descripción |
| --- | --- | --- |
| ACT-01 | Usuario No Autenticado | Usuario no autenticado que puede explorar la landing page, iniciar sesión o registrarse, pero no generar rutas de aprendizaje |
| ACT-02 | Usuario Autenticado | Usuario autenticado vía Supabase Auth que gestiona su historial y marca progresos en sus nodos y generar mapas de aprendizaje. |
| ACT-03 | Gemini API (IA) | Actor externo (Sistema) que provee el motor de IA para la generación de la estructura educativa en formato JSON |
| ACT-04 | Administrador | Perfil con privilegios para la monitorización de métricas de uso y gestión de la persistencia de datos. |

Tabla  - Definición de Actores

Especificación Funcional

Diagrama de Casos de Uso (UML)

Ilustración 3 - Diagrama Casos de Uso

Tablas de especificación de Casos de Uso

| UC-01 | Autenticarse | Autenticarse |
| --- | --- | --- |
| Actor | Usuario No Autenticado | Usuario No Autenticado |
| Interés | Acceder a las funciones personalizadas del sistema (generar, guardado, historial, perfil) | Acceder a las funciones personalizadas del sistema (generar, guardado, historial, perfil) |
| Precondición | No tener una sesión activa y el usuario ya tiene una cuenta creada | No tener una sesión activa y el usuario ya tiene una cuenta creada |
| Garantía | El usuario accede a su entorno privado de forma segura | El usuario accede a su entorno privado de forma segura |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario introduce sus credenciales en el formulario de acceso. |
| Flujo Básico | 2 | El sistema valida la identidad del usuario con el servicio de gestión de identidades. |
| Flujo Básico | 3 | El sistema confirma la validez de los datos y autoriza el acceso al entorno privado. |
| Flujo Básico | 4 | El sistema redirige al usuario a su panel de control personalizado. |
| Excepciones | 2.a | Credenciales incorrectas: El sistema muestra un mensaje de error y permite reintentar el acceso. |
| Excepciones | 2.b | Error de red: El sistema informa de la imposibilidad de conectar con el servidor de autenticación. |
| Requisitos esp. | RNF-01 (Seguridad y Privacidad), RF-02 (Login), RI-01 (Datos de Usuario) | RNF-01 (Seguridad y Privacidad), RF-02 (Login), RI-01 (Datos de Usuario) |

Tabla  - Caso de Uso UC-01

| UC-02 | Registrarse | Registrarse |
| --- | --- | --- |
| Actor | Usuario No Autenticado | Usuario No Autenticado |
| Interés | Crear una cuenta nueva para poder guardar rutas y acceder al perfil. | Crear una cuenta nueva para poder guardar rutas y acceder al perfil. |
| Precondición | El usuario no debe estar identificado en el sistema. | El usuario no debe estar identificado en el sistema. |
| Garantía | El sistema crea el perfil del usuario de forma segura. | El sistema crea el perfil del usuario de forma segura. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario completa el formulario de registro. |
| Flujo Básico | 2 | El sistema envía los datos al servicio de gestión de usuarios. |
| Flujo Básico | 3 | El sistema confirma la creación de la cuenta. |
| Excepciones | 1.a | Email ya existente: El sistema indica que el correo ya está en uso. |
| Excepciones | 1.b | Contraseña débil: El sistema solicita una clave más segura |
| Requisitos esp. | RF-01 (Registro), RNF-01 (Seguridad) | RF-01 (Registro), RNF-01 (Seguridad) |

Tabla  -  Caso de Uso UC-02

| UC-03 | Recuperar Contraseña | Recuperar Contraseña |
| --- | --- | --- |
| Actor | Usuario No Autenticado | Usuario No Autenticado |
| Interés | Restablecer el acceso a la cuenta en caso de haber olvidado la clave actual. | Restablecer el acceso a la cuenta en caso de haber olvidado la clave actual. |
| Precondición | El usuario debe haber creado una cuenta previamente con su correo. | El usuario debe haber creado una cuenta previamente con su correo. |
| Garantía | El sistema permite generar una nueva contraseña tras verificar la identidad. | El sistema permite generar una nueva contraseña tras verificar la identidad. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario solicita la recuperación introduciendo su correo. |
| Flujo Básico | 2 | El sistema envía un enlace de restablecimiento al email indicado. |
| Flujo Básico | 3 | El usuario pulsa el enlace y define su nueva contraseña. |
| Excepciones | 1.a | Correo no registrado: El sistema informa que no existe ninguna cuenta asociada a ese email. |
| Excepciones | 2.a | Enlace caducado: El sistema solicita repetir el proceso si el tiempo ha expirado. |
| Requisitos esp. | RNF-01 (Seguridad), RF-12 (Recuperar Contraseña) | RNF-01 (Seguridad), RF-12 (Recuperar Contraseña) |

Tabla  -  Caso de Uso UC-03

| UC-04 | Cerrar Sesión | Cerrar Sesión |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Finalizar la sesión para proteger la privacidad | Finalizar la sesión para proteger la privacidad |
| Precondición | Tener una sesión activa en el sistema | Tener una sesión activa en el sistema |
| Garantía | Se revoca el acceso a las funciones privadas en el dispositivo actual | Se revoca el acceso a las funciones privadas en el dispositivo actual |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario pulsa sobre la opción de "Cerrar Sesión" en el menú de usuario. |
| Flujo Básico | 2 | El sistema solicita la invalidación de la sesión actual al servicio de identidad. |
| Flujo Básico | 3 | El sistema elimina los datos de sesión activa del navegador o dispositivo. |
| Flujo Básico | 4 | El sistema redirige al usuario a la vista de inicio para usuarios no autenticados. |
| Excepciones | 4 | 2.a |
| Fallo de comunicación: El sistema prioriza el cierre de sesión local para garantizar la privacidad inmediata. | Requisitos esp. | RNF-01 (Seguridad) |
| RNF-01 (Seguridad) |

Tabla  -  Caso de Uso UC-04

| UC-05 | Gestionar Perfil | Gestionar Perfil |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Modificar los datos personales y preferencias de la cuenta para personalizar la experiencia. | Modificar los datos personales y preferencias de la cuenta para personalizar la experiencia. |
| Precondición | El usuario debe haber iniciado sesión previamente (UC-01). | El usuario debe haber iniciado sesión previamente (UC-01). |
| Garantía | Los cambios se aplican de forma inmediata y persistente en el perfil del usuario. | Los cambios se aplican de forma inmediata y persistente en el perfil del usuario. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario accede al apartado de "Configuración" o "Perfil" desde el menú principal. |
| Flujo Básico | 2 | El usuario modifica los campos deseados (nombre, correo o preferencias de aprendizaje). |
| Flujo Básico | 3 | El usuario pulsa el botón de "Guardar Cambios". |
| Flujo Básico | 4 | El sistema valida los datos y confirma que la actualización se ha realizado con éxito. |
| Excepciones | 3.a | Datos inválidos: El sistema detecta que un campo no cumple el formato (ej. email mal escrito) y solicita su corrección. |
| Excepciones | 4.a | Error de conexión: El sistema informa que no se han podido guardar los cambios y sugiere reintentarlo. |
| Requisitos esp. | RF-08 (Gestión de Perfil), RNF-01 (Seguridad), RI-01 (Datos de Usuario) | RF-08 (Gestión de Perfil), RNF-01 (Seguridad), RI-01 (Datos de Usuario) |

Tabla  -  Caso de Uso UC-05

| UC-06 | Generar Ruta de Aprendizaje | Generar Ruta de Aprendizaje |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Obtener una hoja de ruta estructurada sobre un tema específico | Obtener una hoja de ruta estructurada sobre un tema específico |
| Precondición | Conexión activa con el servicio de Inteligencia Artificial | Conexión activa con el servicio de Inteligencia Artificial |
| Garantía | Presentación visual de una ruta de aprendizaje coherente | Presentación visual de una ruta de aprendizaje coherente |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario introduce el tema o habilidad que desea aprender en el buscador principal. |
| Flujo Básico | 2 | El sistema envía la petición al Servicio de IA para procesar y estructurar el contenido |
| Flujo Básico | 3 | El sistema recibe los datos estructurados y construye el mapa interactivo. |
| Flujo Básico | 4 | El sistema presenta la ruta en pantalla permitiendo la interacción con los nodos. |
| Excepciones | 2.a | Fallo IA: El sistema notifica el fallo técnico y sugiere intentarlo más tarde. |
| Excepciones | 3.b | Input vacío: El sistema informa si la entrada es ambigua o no cumple los parámetros. |
| Requisitos esp. | RF-03 (Generación de Rutas), RNF-03 (Integridad de datos), RI-02 (Estructura de Rutas),RNF-02 (Usabilidad),RNF-04 (Disponibilidad), RNF-05 (Tiempo de respuesta) | RF-03 (Generación de Rutas), RNF-03 (Integridad de datos), RI-02 (Estructura de Rutas),RNF-02 (Usabilidad),RNF-04 (Disponibilidad), RNF-05 (Tiempo de respuesta) |

Tabla  -  Caso de Uso UC-06

| UC-07 | Guardar Ruta | Guardar Ruta |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Almacenar una ruta de aprendizaje generada para poder consultarla y marcar progreso en el futuro. | Almacenar una ruta de aprendizaje generada para poder consultarla y marcar progreso en el futuro. |
| Precondición | El usuario debe estar autenticado (UC-01) y haber generado previamente una ruta (UC-06). | El usuario debe estar autenticado (UC-01) y haber generado previamente una ruta (UC-06). |
| Garantía | La ruta queda vinculada permanentemente al perfil del usuario. | La ruta queda vinculada permanentemente al perfil del usuario. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario selecciona la opción de "Guardar" tras visualizar una ruta recién generada. |
| Flujo Básico | 2 | El sistema solicita la confirmación del guardado y, opcionalmente, un nombre para la ruta. |
| Flujo Básico | 3 | El sistema registra la estructura de la ruta y la asocia al identificador del usuario. |
| Flujo Básico | 4 | El sistema confirma al usuario que la ruta ha sido almacenada correctamente en su historial. |
| Excepciones | 4 | 3.a |
| Error de almacenamiento: El sistema informa si ha habido un problema al intentar persistir los datos y permite reintentar. | Requisitos esp. | RF-05 (Guardado de rutas), RNF-04 (Disponibilidad), RI-02 (Estructura de Ruta) |
| RF-05 (Guardado de rutas), RNF-04 (Disponibilidad), RI-02 (Estructura de Ruta) |

Tabla  -  Caso de Uso UC-07

| UC-08 | Consultar Historial | Consultar Historial |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Recuperar y revisar rutas de aprendizaje generadas anteriormente para continuar con el estudio. | Recuperar y revisar rutas de aprendizaje generadas anteriormente para continuar con el estudio. |
| Precondición | El usuario debe haber iniciado sesión (UC-01). | El usuario debe haber iniciado sesión (UC-01). |
| Garantía | El sistema muestra una lista íntegra de las rutas asociadas a la cuenta del usuario. | El sistema muestra una lista íntegra de las rutas asociadas a la cuenta del usuario. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario accede a la sección de "Mis Rutas" o "Historial" desde su perfil. |
| Flujo Básico | 2 | El sistema solicita al almacén de datos el listado de rutas vinculadas al usuario. |
| Flujo Básico | 3 | El sistema organiza las rutas cronológicamente o por relevancia. |
| Flujo Básico | 4 | El sistema presenta al usuario una lista de sus rutas guardadas para su selección. |
| Excepciones | 4 | 2.a |
| Historial vacío: El sistema informa que aún no existen rutas guardadas y sugiere generar una nueva. | 4 | 3.a |
| Error de carga: El sistema notifica que no se ha podido recuperar la información y permite reintentar. | Requisitos esp. | RF-04 (Consulta de Historial),RNF-03 (Integridad de datos),RI-02 (Estructura de Ruta) |
| RF-04 (Consulta de Historial),RNF-03 (Integridad de datos),RI-02 (Estructura de Ruta) |

Tabla  -  Caso de Uso UC-08

| UC-09 | Marcar Progreso | Marcar Progreso |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Llevar un control visual de qué partes de la ruta ya han sido asimiladas o completadas. | Llevar un control visual de qué partes de la ruta ya han sido asimiladas o completadas. |
| Precondición | El usuario debe estar autenticado y tener al menos una ruta guardada en su historial. | El usuario debe estar autenticado y tener al menos una ruta guardada en su historial. |
| Garantía | El estado de los nodos de la ruta se actualiza de forma persistente en el perfil del usuario. | El estado de los nodos de la ruta se actualiza de forma persistente en el perfil del usuario. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario selecciona un nodo o tema específico dentro de una ruta guardada. |
| Flujo Básico | 2 | El usuario activa el control de "Completado" o "En curso" para ese tema. |
| Flujo Básico | 3 | El sistema actualiza el estado del progreso en el perfil del usuario. |
| Flujo Básico | 4 | El sistema refresca la interfaz visual para reflejar el avance conseguido. |
| Excepciones | 4 | 3.a |
| Fallo en la actualización: El sistema informa que el progreso no se ha podido guardar localmente o en la nube. | Requisitos esp. | RF-06 (Seguimiento de Progreso), RNF-03 (Integridad de datos), RI-02 (Estructura de Ruta) |
| RF-06 (Seguimiento de Progreso), RNF-03 (Integridad de datos), RI-02 (Estructura de Ruta) |

Tabla  - Caso de Uso UC-09

| UC-10 | Eliminar Ruta | Eliminar Ruta |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Eliminar de forma definitiva rutas del historial que ya no son útiles para el usuario. | Eliminar de forma definitiva rutas del historial que ya no son útiles para el usuario. |
| Precondición | El usuario debe estar autenticado (UC-01) y tener al menos una ruta en su historial. | El usuario debe estar autenticado (UC-01) y tener al menos una ruta en su historial. |
| Garantía | La ruta y su progreso asociado se eliminan permanentemente del perfil del usuario. | La ruta y su progreso asociado se eliminan permanentemente del perfil del usuario. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario accede a su historial de rutas y selecciona la que desea borrar. |
| Flujo Básico | 2 | El usuario activa el control de eliminación (icono de papelera o botón borrar). |
| Flujo Básico | 3 | El sistema solicita una confirmación para evitar borrados accidentales. |
| Flujo Básico | 4 | El sistema procesa la baja de la ruta y actualiza la lista del historial automáticamente. |
| Excepciones | 4 | 3.a |
| Cancelación del usuario: Si el usuario no confirma la acción, el sistema mantiene la ruta intacta. | 4 | 4.a |
| Error de sincronización: El sistema informa si la operación de borrado no pudo completarse en el servidor. | Requisitos esp. | RNF-03 (Integridad de datos), RI-02 (Estructura de Ruta) |
| RNF-03 (Integridad de datos), RI-02 (Estructura de Ruta) |

Tabla  - Caso de Uso UC-10

| UC-11 | Acceder Panel Admin | Acceder Panel Admin |
| --- | --- | --- |
| Actor | Administrador | Administrador |
| Interés | Entrar en un área restringida para gestionar el funcionamiento global de la web. | Entrar en un área restringida para gestionar el funcionamiento global de la web. |
| Precondición | El usuario debe estar identificado con una cuenta que tenga permisos de administrador. | El usuario debe estar identificado con una cuenta que tenga permisos de administrador. |
| Garantía | El sistema permite la entrada solo si el nivel de acceso es el adecuado. | El sistema permite la entrada solo si el nivel de acceso es el adecuado. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario selecciona la opción "Panel de Control". |
| Flujo Básico | 2 | El sistema verifica que el usuario es administrador. |
| Flujo Básico | 3 | Se muestra el menú con las herramientas de gestión |
| Excepciones | 3 | 2.a |
| Usuario sin permisos: El sistema deniega el acceso y muestra un mensaje de error. | Requisitos esp. | RF-10 (Panel de Estadísticas) |
| RF-10 (Panel de Estadísticas) |

Tabla  - Caso de Uso UC-11

| UC-12 | Consultar Estadísticas | Consultar Estadísticas |
| --- | --- | --- |
| Actor | Administrador | Administrador |
| Interés | Analizar el uso de la aplicación | Analizar el uso de la aplicación |
| Precondición | El administrador debe haber accedido previamente al panel de control (UC-11). | El administrador debe haber accedido previamente al panel de control (UC-11). |
| Garantía | El sistema permite la entrada solo si el nivel de acceso es el adecuado. | El sistema permite la entrada solo si el nivel de acceso es el adecuado. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El administrador elige el apartado de "Estadísticas". |
| Flujo Básico | 2 | El sistema recopila los datos de uso de la base de datos y la IA. |
| Flujo Básico | 3 | Se muestran gráficos y tablas comparativas de actividad. |
| Excepciones | 3 | 2.a |
| Error de datos: El sistema informa si hay problemas para obtener las métricas en ese momento. | Requisitos esp. | RF-10 (Panel de Estadísticas) |
| RF-10 (Panel de Estadísticas) |

Tabla  - Caso de Uso UC-12

| UC-13 | Borrar Cuenta | Borrar Cuenta |
| --- | --- | --- |
| Actor | Usuario Autenticado | Usuario Autenticado |
| Interés | Eliminar de forma definitiva toda la información personal y el historial del sistema. | Eliminar de forma definitiva toda la información personal y el historial del sistema. |
| Precondición | El usuario debe haber iniciado sesión (UC-01) y estar en el apartado de ajustes de perfil (UC-05). | El usuario debe haber iniciado sesión (UC-01) y estar en el apartado de ajustes de perfil (UC-05). |
| Garantía | El sistema elimina el perfil y los datos asociados, cumpliendo con la normativa de privacidad. | El sistema elimina el perfil y los datos asociados, cumpliendo con la normativa de privacidad. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El usuario selecciona la opción de "Eliminar cuenta". |
| Flujo Básico | 2 | El sistema muestra un mensaje de advertencia y pide confirmación. |
| Flujo Básico | 3 | El usuario confirma la acción. |
| Flujo Básico | 4 | El sistema borra el registro del usuario y todas sus rutas guardadas. |
| Excepciones | 4 | 3.a |
| Cancelación: Si el usuario no confirma la acción, el proceso se detiene y la cuenta permanece activa. | Requisitos esp. | RF-11 (Borrado de Cuenta) |
| RF-11 (Borrado de Cuenta) |

Tabla  - Caso de Uso UC-13

| UC-14 | Procesar Prompt (IA) | Procesar Prompt (IA) |
| --- | --- | --- |
| Actor | Gemini API (IA) | Gemini API (IA) |
| Interés | Transformar la petición del usuario en una estructura de pasos lógica y organizada para el aprendizaje. | Transformar la petición del usuario en una estructura de pasos lógica y organizada para el aprendizaje. |
| Precondición | El sistema debe haber recibido un tema válido desde el caso de uso de "Generar Ruta" (UC06). | El sistema debe haber recibido un tema válido desde el caso de uso de "Generar Ruta" (UC06). |
| Garantía | El sistema obtiene una respuesta estructurada que permite dibujar el mapa de aprendizaje. | El sistema obtiene una respuesta estructurada que permite dibujar el mapa de aprendizaje. |
| Flujo Básico | Paso | Acción |
| Flujo Básico | 1 | El sistema prepara la consulta con las instrucciones necesarias para la IA. |
| Flujo Básico | 2 | El sistema envía la petición a la Inteligencia Artificial externa. |
| Flujo Básico | 3 | La IA analiza el tema y responde con los conceptos clave y sus conexiones. |
| Flujo Básico | 4 | El sistema recibe la respuesta y la deja lista para mostrarla visualmente. |
| Excepciones | 4 | 2.a |
| Error de conexión: Si el servicio de IA no responde, el sistema informa del fallo técnico. | 4 | 3.a |
| Respuesta incomprensible Si la IA devuelve algo que el sistema no entiende, se solicita una nueva generación.: | Requisitos esp. | RF-13 (Procesamiento IA) |
| RF-13 (Procesamiento IA) |

Tabla  - Caso de Uso UC-14

Requisitos del Sistema (SRS)

Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Actor | CU | Prioridad |
| --- | --- | --- | --- | --- | --- |
| RF-01 | Registro | El sistema permitirá a los nuevos usuarios crear una cuenta mediante correo y contraseña. | Usuario No Autenticado | UC-02 | Alta |
| RF-02 | Login | El sistema permitirá el acceso a usuarios registrados mediante validación de credenciales. | Usuario No Autenticado | UC-01 | Alta |
| RF-03 | Generación Rutas | El sistema debe generar una estructura de aprendizaje basada en la entrada del usuario mediante IA. | Usuario Autenticado | UC-06 | Alta |
| RF-04 | Consulta de historial | El sistema permitirá visualizar el listado de todas las rutas guardadas por el usuario. | Usuario Autenticado | UC-08 | Alta |
| RF-05 | Guardado de rutas | El sistema permitirá almacenar rutas generadas en el perfil del usuario para su consulta posterior. | Usuario Autenticado | UC-07 | Media |
| RF-06 | Seguimiento de progreso | El sistema permitirá marcar temas o nodos de la ruta como completados. | Usuario Autenticado | UC-09 | Media |
| RF-07 | Eliminación de rutas | El sistema permitirá borrar rutas del historial del usuario de forma permanente. | Usuario Autenticado | UC-10 | Media |
| RF-08 | Gestión de perfil | El usuario podrá modificar sus datos personales y preferencias de cuenta. | Usuario Autenticado | UC-05 | Media |
| RF-09 | Cierre de sesión | El sistema permitirá finalizar la sesión activa de forma segura. | Usuario Autenticado | UC-04 | Alta |
| RF-10 | Panel de estadísticas | El sistema ofrecerá al administrador métricas de uso global de la aplicación. | Administrador | UC-12, UC-11 | Baja |
| RF-11 | Borrado de Cuenta | El usuario podrá eliminar su perfil y todos sus datos personales de forma permanente | Usuario Autenticado | UC-13 | Alta |
| RF-12 | Recuperar Contraseña | El usuario podrá recuperar el acceso a su cuenta si ha olvidado su contraseña a su cuenta poniendo una nueva contraseña | Usuario No Autenticado | UC-03 | Alta |
| RF-13 | Procesamiento IA | El sistema procesará la respuesta de la IA para asegurar que el formato sea válido y compatible con la visualización de la ruta de aprendizaje. | Gemini API (IA) | UC-14 | Alta |

Tabla  - Requisitos Funcionales

Requisitos No Funcionales (RNF)

| ID | Categoría | Descripción y Métrica |
| --- | --- | --- |
| RNF-01 | Seguridad y Privacidad | Los datos de los usuarios y sus contraseñas deben gestionarse de forma cifrada y segura con el método de cifrado Bcrypt. |
| RNF-02 | Usabilidad (UX) | La interfaz debe ser intuitiva, permitiendo generar una ruta en menos de tres pasos. |
| RNF-03 | Integridad de datos | Cualquier cambio en el historial o progreso debe sincronizarse correctamente para evitar pérdidas. |
| RNF-04 | Disponibilidad | El sistema debe estar 99.5% operativo, dependiendo de la disponibilidad de la API de IA. |
| RNF-05 | Tiempo de respuesta | La generación de la ruta por parte de la IA no debería exceder los 10-15 segundos. |
| RNF-06 | Cumplimiento de Accesibilidad | La interfaz debe cumplir con el nivel de conformidad AA de las pautas WCAG 2.1, garantizando la navegación por teclado y contraste adecuado. |
| RNF-07 | Rendimiento y Carga | El tiempo de carga inicial debe ser inferior a 2.5 segundos en condiciones normales, optimizado mediante el despliegue en Vercel. |

Tabla  - Requisitos No Funcionales

Requisitos de Información (RI)

| ID: RI-01 | Nombre: Datos de Usuario |
| --- | --- |
| Objetivos | OBJ-01, OBJ-10, OBJ-11 |
| Descripción | El sistema debe almacenar los perfiles de los usuarios para permitir la personalización de la experiencia y la persistencia de datos. |
| Datos concretos | ID (UUID) (PK) Nombre (VARCHAR) Apellidos (VARCHAR) Email (VARCHAR) Password_hash (VARCHAR) Rol (VARCHAR) |
| Importancia | Alta |
| Estabilidad | Alta |
| Comentarios | El campo email es el identificador principal para el inicio de sesión. El rol por defecto es "Usuario". |

Tabla 31 - Requisito Información 1

| ID: RI-02 | Nombre: Rutas de Aprendizaje |
| --- | --- |
| Objetivos | OBJ-02,OBJ-03,OBJ-05,OBJ-06,OBJ-07, OBJ-09 |
| Descripción | Almacena la estructura de las hojas de ruta generadas por la IA y guardadas por los usuarios. |
| Datos concretos | ID de Ruta (UUID) (PK) ID de Usuario (UUID) (FK) Título del Tema (VARCHAR) Estructura JSON (Contiene posiciones X/Y, tipos de nodos, progreso, conexiones y recursos de cada nodo). (JSONB) Fecha de creación (TIMESTAMP) |
| Importancia | Alta |
| Estabilidad | Alta |
| Comentarios | El contenido se almacena en un formato que permite la reconstrucción del grafo interactivo. |

Tabla  - Requisito Información 2

| ID: RI-03 | Nombre: Métricas del Sistema |
| --- | --- |
| Objetivos | OBJ-08 |
| Descripción | Datos agregados sobre el uso de la plataforma para la consulta del administrador. |
| Datos concretos | ID (UUID) (PK) ID_Usuario (UUID) (FK) Temas consultados (VARCHAR) |
| Importancia | Baja |
| Estabilidad | Media |
| Comentarios | Estos datos son de solo lectura para el perfil de Administrador y sirven para el análisis de rendimiento. |

Tabla  - Requisito Información 3

Normativa y Legislación

Protección de Datos (RGPD y LOPDGDD)

La plataforma cumple con el Reglamento General de Protección de Datos (UE) 2016/679 	mediante las siguientes medidas:

Minimización de datos: Solo se solicita el correo electrónico, nombres y apellidos para la gestión de la cuenta mediante Supabase Auth. No se almacenan direcciones físicas ni números de teléfono.

Alojamiento y Transferencia: La base de datos de Supabase está configurada en la región AWS Frankfurt (eu-central-1), garantizando que los datos personales no salgan del Espacio Económico Europeo, cumpliendo el estándar SOC2 y RGPD europeo.

Derecho al Olvido: El usuario dispone en su panel de configuración de una opción para “Eliminar Cuenta”. Al ejecutarla, el sistema realiza un borrado en cascada que elimina tanto las credenciales de acceso y datos del usuario como también todo su historial de rutas y progreso en la base de datos PostgreSQL.

Política de Cookies: La aplicación utiliza únicamente cookies técnicas y de sesión necesarias para mantener el estado del usuario (Token JWT). Al no utilizar cookies de rastreo de terceros (como Google Analytics), la plataforma es más respetuosa con la privacidad y simplifica el banner de consentimiento.

LSSI-CE (Sociedad de la Información y Comercio Electrónico)

Dado que PathFinderAI se presenta actualmente como una herramienta de carácter educativo y no comercial:

Gratuidad: No se realizan transacciones económicas, por lo que no aplica la gestión de IVA ni facturación.

Transparencia: En el apartado de “Información” o “Aviso Legal” de la web, son visibles los datos del responsable del proyecto (Adrián Gómez Izquierdo) y un correo de contacto para atender cualquier consulta legal.

Accesibilidad (WCAG)

Contraste y Color: Se ha utilizado herramientas de comprobación de contraste en los colores de Tailwind CSS para asegurar que los textos sobre los nodos sean legibles para personas con baja visión.

Navegación: El mapa interactivo (React Flow) permite el desplazamiento mediante teclado y los elementos interactivos cuentas con estados de focus claramente visibles.

Semántica: Se hace uso de etiquetas ARIA en los modales de detalle y textos alt descriptivos en cualquier elemento gráfico no textual generado por la IA.

Transparencia en el uso de la Inteligencia Artificial

Se garantiza la privacidad en las consultas al modelo de lenguaje:

Los prompts enviados a Gemini contienen únicamente el tema de estudio, sin enviar en ningún caso datos personales identificables del usuario a terceros (Google).

Cláusula de Exención de Responsabilidad (IA)

Dado que PathFinderAI utiliza la API de Google Gemini para la generación automatizada de rutas de aprendizaje, el usuario acepta que:

Naturaleza del servicio: El sistema se ofrece exclusivamente como una herramienta de apoyo y orientación al estudio, no como una fuente de verdad absoluta.

Veracidad de los datos: No garantizamos la exactitud de los itinerarios, ya que dependen de un modelo de IA externo.

Responsabilidad: El titular no se responsabiliza de las decisiones tomadas según la IA; se recomienda contrastar siempre con fuentes oficiales.

Licencias de Software

En el desarrollo de PathFinderAI se han seleccionado herramientas con licencias permisivas:

| Software / Librería | Licencia | Compatibilidad |
| --- | --- | --- |
| React 18 | MIT | Compatible. Permite uso y modificación libre. |
| React Flow 11 | MIT | Compatible. Librería para renderizado del mapa de aprendizaje. |
| Node.js / Express | MIT | Compatible. Base del servidor Proxy. |
| Tailwind CSS | MIT | Compatible. Framework de estilos. |
| Supabase | Apache 2.0 / MIT | Compatible. Gestión de Backend y BBDD. |
| Lucide React (Iconos) | ISC | Compatible. Licencia equivalente a MIT |

Tabla  - Licencias Software

Diseño Tecnológico y Arquitectura

Herramientas y Tecnologías

Frontend:

HTML 5 (Lenguaje Marcado): Estructura semántica de la aplicación, esencial para la accesibilidad y el posicionamiento en buscadores.

CSS3 / Tailwind 3.4 (Estilización): Cascading Style Sheets (CSS). Se emplea Tailwind por su metodología de clases de utilidad, que acelera el diseño responsivo sin generar archivos pesados.

JavaScript ES6+ (Lógica Frontend): Lenguaje fundamental para la interactividad. Permite el manejo de sincronía y la manipulación dinámica de los datos del itinerario.

React 18 (Librería UI): User Interface (UI). Se justifica su uso por el manejo eficiente del Virtual DOM, permitiendo actualizaciones en tiempo real de los nodos sin recargar la página.

React Flow 11 (Visualización): Librería crítica para el proyecto. Permite la manipulación de grafos en el Document Object Model (DOM) de forma eficiente mediante nodos y bordes programables.

Vercel (Despliegue FrontEnd): Plataforma de alojamiento para el Frontend. Se elige por su integración nativa con React y su red de entrega de contenidos que mejora la velocidad de carga global.

Backend:

Node.js 20 (Entorno Servidor): Entorno de ejecución para el Backend que permite procesar múltiples peticiones de forma no bloqueante.

Express (Framework Backend): Actúa como un Servidor Proxy necesario para ocultar la clave privada de la API de Gemini, garantizando una comunicación segura.

Render (Despliegue BackEnd): Servidor persistente sin timeouts de 30s ni cold starts. Permite procesar prompts complejos y mantiene conexión directa con Supabase sin configuraciones externas.

Base de Datos:

PostgreSQL 16 (Base de Datos): Gestor de base de datos relacional utilizado para almacenar las rutas mediante el tipo JSONB, optimizando la flexibilidad de los datos de la IA.

Supabase (BaaS): BaaS. Es fundamental para la gestión de usuarios y la persistencia de datos profesional mediante políticas de seguridad a nivel de fila.

API:

Gemini API (IA): Motor de IA de Google que genera el contenido educativo estructurado tras recibir las peticiones del usuario.

Control de Versiones:

Git/Github: Herramientas para el seguimiento del código y el almacenamiento remoto, permitiendo un flujo de trabajo profesional y seguro.

IDE:

Visual Studio Code: Integrated Development Environment (IDE). Entorno principal de desarrollo seleccionado por su amplio ecosistema de extensiones para la depuración de código.

Arquitectura del Software

La arquitectura de PathFinderAI se ha diseñado bajo un enfoque de Arquitectura Desacoplada (Client-Server), siguiendo un patrón de N-Capas en el backend para garantizar que el sistema sea escalable, mantenible y fácil de testear.

Tipo de Arquitectura: N-Capas y Basada en Componentes

El proyecto se divide en dos grandes bloques independientes:

Frontend (Arquitectura Basada en Componentes): Utilizando React, la interfaz se organiza en componentes reutilizables. Esto permite que la lógica visual del grafo (React Flow) esté asilada de la lógica de gestión de usuarios.

Backend (Arquitectura de N-Capas / MVC): El servidor Node.js/Express actúa como una API RESTful. Se sigue una estructura de capas para separar las responsabilidades.

Capa de Rutas: Define los puntos de entrada (Endpoints).

Capa de Controladores: Gestiona la lógica de las peticiones y respuestas.

Capa de Servicios: Centraliza la comunicación con servicios externos (Gemini API) y la lógica de negocio compleja.

Capa de Modelos: Define la estructura de datos y la interacción con Supabase.

Organización de Carpetas

Ilustración  - Estructura de Carpetas del Proyecto

Ejemplo de Respuesta Gemini API (JSON)

El JSON que devolverá Gemini API al enviarle el Prompt para pedirle que genere un mapa de aprendizaje tendrá la siguiente estructura:

Nodes: Array de objetos que contienen los nodos del mapa.

ID: Id numérico que identifica al nodo.

Position: Posición del nodo en el mapa visual con coordenadas x e y.

Data: Array de objetos de datos que tiene cada nodo.

Label: Título del nodo.

Status: Define el estado del nodo.

Resources: Enlaces para aprender sobre el tema de ese nodo.

Edges: Define las conexiones de los nodos en el mapa de aprendizaje por los ids de cada nodo.

A continuación, se adjunta una captura aproximada de la estructura JSON que devolverá Gemini API al enviarle el prompt para que realice el mapa (puede haber errores):

Ilustración  - Estructura JSON Mapa de Aprendizaje para React Flow

Ejemplo de Respuesta Supabase (JSON)

El JSON que devuelve Supabase al hacer SELECT * from roadmaps devolvería los siguientes datos:

ID: Id único para identificar al mapa de aprendizaje.

ID_Usuario: Id único del usuario creador del mapa de aprendizaje.

Título_tema: Nombre del tema que ha solicitado el usuario para generar un mapa de aprendizaje.

Fecha_Creación: Fecha de creación cuando se creó el mapa de aprendizaje y se insertó en la base de datos.

JSON: Estructura del mapa de aprendizaje generado por Gemini API que se utilizará para su uso posterior en React Flow.

A continuación, se adjunta una captura de la estructura JSON aproximada que devolverá la API de Supabase:

Ilustración  - Estructura JSON de datos devueltos por Supabase

Interfaz de Comunicación

La comunicación entre ambas partes se realiza de forma asíncrona mediante el protocolo HTTP y una API REST.

Protocolo de Intercambio: Se utiliza exclusivamente el formato JSON para el envío y recepción de datos.

Flujo de Comunicación:

1. El Frontend envía un POST al backend con el tema solicitado por el usuario.

2. El Backend recibe la petición, valida el token de sesión y solicita la generación 	de la ruta al ServicioIA.

3. El ServicioIA procesa la respuesta de la IA y la transforma en un objeto JSON 	compatible con ReactFlow (incluyendo nodos, conexiones y recursos).

4. El Backend devuelve este JSON al cliente con un código de estado 200 OK.

5. El Frontend recibe los datos y actualiza el estado local para que React Flow 	renderice el mapa automáticamente.

Nota sobre Seguridad: Todas las comunicaciones sensibles (como el guardado de rutas o acceso a métricas) están protegidas mediante el middleware de autenticación de Supabase, asegurando que solo los usuarios autorizados puedan realizar peticiones de escritura o consulta.

Diseño de datos

Modelo Entidad-Relación

Ilustración  - Modelo Entidad-Relación

Modelo Relacional

Ilustración  - Modelo Relacional

Diagrama de Clases UML

Ilustración  - Diagrama de Clases

Diseño de Interfaz

Wireframe

Ilustración  - Wireframe

Mockup (Diseño Final)

Ilustración  - Mockup (Diseño Final)

Justificación UI/UX

Jerarquía Visual

Se implementa una jerarquía de tres niveles para dirigir la atención del usuario de forma eficiente:

Nivel Primario: El título principal (“¿Qué quieres aprender hoy?”) utiliza el mayor peso visual mediante un tamaño de fuente extra-bold y un interlineado ajustado. Este es el primer elemento que el usuario procesa.

Nivel Secundario: El subtítulo actúa como apoyo informativo, utilizando un peso visual más ligero para no competir con el titular, pero manteniendo la legibilidad.

Nivel de Acción (CTA): El botón de “Registrarse” se ha diseñado con el contraste cromático respecto al fondo. Su ubicación arriba a la derecha y su relleno sólido lo convierten con mayor “afinidad de clic”.

Flujo Visual (Patrón en Z)

El diseño se ha estructurado siguiendo un recorrido en patrón Z, optimizando la exploración natural del usuario en la web:

Punto de entrada: El logo en la esquina superior izquierda establece la identidad de marca.

Barrido horizontal: La vista se desplaza hacia los enlaces de navegación y el botón de acceso en la parte superior derecha.

Diagonal de escaneo: El usuario desciende visualmente a través del área central vacía hasta impactar con el titular principal.

Punto de conversión: El flujo finaliza con el botón de acción central, donde el usuario toma la decisión de interactuar con la herramienta.

Accesibilidad (A11y)

Se están aplicando los estándares básicos de accesibilidad para garantizar una experiencia inclusiva:

Contraste: Se han validado que el contraste entre el texto claro y el fondo oscuro cumple con los requisitos necesarios para una lectura cómoda en diferentes condiciones lumínicas. Y algunos botones como los de temas sugeridos se iluminan al pasar el ratón por encima para mejorar su lectura.

Identificabilidad: Los elementos interactivos, como los botones, presentan formas claramente diferenciadas y estilos visuales (hover/focus) que facilitarán su uso mediante teclado o lectores de pantalla.

Tipografía: Se han seleccionado fuentes sans-serif de alta legibilidad para evitar la fatiga visual durante el consumo de los itinerarios complejos.

Consistencia

Se mantiene una consistencia estructural estricta entre el diseño conceptual y el desarrollo actual:

La disposición de los bloques de contenido en el wireframe se ha respetado íntegramente en el mockup.

Esta coherencia garantiza que el desarrollo del frontend en React no sufra desviaciones respecto a la planificación lógica inicial, facilitando la mantenibilidad del código y la reutilización de componentes CSS.

Espacio y Carga Positiva

Para evitar la sobrecarga cognitiva del estudiante, priorizamos el uso de espacios en blanco:

Padding y Márgenes:  Se ha dejado suficiente aire entre los elementos del encabezado y el cuerpo central para que la interfaz no se perciba saturada.

Enfoque: Al eliminar elementos incensarios en la página principal, el sistema reduce el número de decisiones que el usuario debe tomar, dirigiendo todo el potencial cognitivo hacia el proceso de generación de la ruta de aprendizaje.

Paleta de Colores

Ilustración  - Paleta de Colores

Planificación y Metodología

Metodología de Trabajo

Para el desarrollo de PathFinderAI se ha optado por una Metodología Ágil basada en el marco de trabajo Scrum, adaptada a un entorno de desarrollo unipersonal. Esta elección se justifica por la necesidad de un enfoque interactivo e incremental, especialmente crítico al integrar tecnologías emergentes como la IA de Gemini, donde los resultados requieren ajustes constantes de prompt engineering y validación de datos.

Justificación del marco Ágil

A diferencia del modelo en Cascada (tradicional), que es rígido y lineal, la metodología ágil permite reaccionar ante imprevistos técnicos sin comprometer el calendario global. En este proyecto, la incertidumbre sobre la estructura exacta de los JSON devueltos por la IA obliga a ciclos de desarrollo rápidos (Spints) para ajustar el renderizado en React Flow de forma inmediata.

Implementación de Scrum (Adaptación)

Se han implementado los siguientes artefactos y ceremonias de forma simplificada:

Product Backlog: Listado priorizado de todas las funcionalidades extraídas de los Objetivos Funcionales (OBJ-01 a OBJ-08).

Spints: El calendario se ha dividido en ciclos de 2 semanas. Cada sprint tiene como objetivo entregar un “Incremento de Software” funcional (por ejemplo, el Sprint 2 finalizó con la conexión estable entre el Proxy y Gemini).

Sprint Backlog: Al inicio de cada fase (según la tabla de planificación), se seleccionan las tareas específicas que se van a completar.

Planificación temporal

Ilustración 13 - Diagrama Gantt

Ver Diagrama de Gantt Completo

| Fase / Categoría | Duración | Semanas | Inicio | Fin |
| --- | --- | --- | --- | --- |
| 1.ANÁLISIS Y MEMORIA INICIAL | 11 días | 1 - 2 | 03/02 | 17/02 |
| 1.1 Estudio del Sector y Viabilidad (Memoria Inicial) | 5 días | 1 | 03/02 | 09/02 |
| 1.2 Selección de Herramientas y Tecnologías | 3 días | 2 | 10/02 | 12/02 |
| 1.3 Definición de Objetivos (SMART y Funcionales) | 3 días | 2 | 13/02 | 17/02 |
| 2. ESPECIFICACIÓN Y PLANIFICACIÓN | 18 días | 3 - 6 | 18/02 | 13/03 |
| 2.1 Normativa y Legislación | 3 días | 3 | 18/02 | 20/02 |
| 2.2 Elaboración de Diagrama de Gantt | 4 días | 4 | 23/02 | 26/02 |
| 2.3 Casos de Usos y Requisitos (RF, RNF, RI) | 11 días | 5 - 6 | 27/02 | 13/03 |
| 3. DISEÑO DEL SISTEMA | 16 días | 7 - 9 | 16/03 | 06/04 |
| 3.1 Diagrama de Clases (UML) | 5 días | 7 | 16/03 | 20/03 |
| 3.2 Modelo de Datos (Relacional / No SQL) | 5 días | 8 | 23/03 | 27/03 |
| 3.3 Estructura y Organización del Software | 2 días | 9 | 30/03 | 31/03 |
| 3.4 Diseño de Interfaz (UI/UX) | 4 días | 9 | 01/04 | 06/04 |
| 4. DESARROLLO INICIAL | 14 días | 10 - 12 | 07/04 | 24/04 |
| 4.1 Entorno y estructura del proyecto | 3 días | 10 | 07/04 | 09/04 |
| 4.2 Implementación del Backend | 5 días | 11 | 10/04 | 16/04 |
| 4.3 Implementación del Frontend | 4 días | 12 | 17/04 | 22/04 |
| 4.4 Plan de Prevención de Riesgos | 2 días | 12 | 23/04 | 24/04 |
| 5. DESARROLLO AVANZADO | 10 días | 13 - 14 | 27/04 | 08/05 |
| 5.1 Desarrollo Avanzado (Funcionalidades Core) | 4 días | 13 | 27/04 | 30/04 |
| 5.2 Diagrama de Despliegue | 4 días | 14 | 01/05 | 06/05 |
| 5.3 Registro de Incidencias | 2 días | 14 | 07/05 | 08/05 |
| 6. FINALIZACIÓN | 10 días | 15 - 16 | 11/05 | 22/05 |
| 6.1 Pruebas (Unitarias e Integración) | 4 días | 15 | 11/05 | 14/05 |
| 6.2Validación Final del Sistema | 2 días | 15 | 15/05 | 18/05 |
| 6.3 Gantt Final Comparativo | 2 días | 16 | 19/05 | 20/05 |
| Conclusiones del Proyecto | 2 días | 16 | 21/05 | 22/05 |

Tabla  - Desglose Diagrama Gantt

Guion de Trabajo

Ilustración 14 - Planificación del Proyecto

Desglose Detallado del Guion de Trabajo

Fase 01: Análisis, Propuesta y Viabilidad (febrero)

En esta etapa inicial se establece la base conceptual y técnica del proyecto:

Introducción y justificación: Se redacta el contexto y la necesidad de una herramienta basada en Inteligencia Artificial para la educación.

Estudio del sector: Se analizan soluciones existentes en el mercado de mapas mentales y generadores de contenido.

Viabilidad: Se evalúan los recursos técnicos y económicos necesarios para el sostenimiento de la plataforma.

Definición de objetivos: Se establecen metas bajo el criterio de Specific, Measurable, Achievable, Relevant, Time-bound (SMART).

Fase 02: Especificación, Funcional, Legal y Planificación (marzo)

Se determinan las reglas de funcionamiento y el marco legal:

Marco legal: Se asegura el cumplimiento del Reglamento General de Protección de Datos (RGPD).

Planificación: Se organiza el calendario de trabajo mediante un diagrama de Gantt.

Casos de uso: Se describen las interacciones de los usuarios con la plataforma.

Requisitos: Se enumeran las funcionalidades obligatorias y las restricciones técnicas del sistema.

Fase 03: Diseño del Sistema (abril)

Se define la arquitectura antes de iniciar la escritura de código:

Estructura técnica: Se establece la arquitectura del sistema y el Unified Modeling Language (UML) para la representación de clases.

Persistencia de datos: Se diseña el modelo de datos para el almacenamiento de los mapas de aprendizaje.

Interfaz de usuario: Se crean los esquemas visuales (Wireframes) y las maquetas finales (Mockups) para garantizar una experiencia de usuario óptima.

Fase 04: Desarrollo e Implementación (abril)

Se procede a la construcción técnica de la aplicación utilizando el conjunto de tecnologías 	seleccionado:

Backend: Se desarrolla la lógica del servidor con Node.js y Express.

Frontend: Se desarrolla la interfaz con React.js y CSS mediante el marco de trabajo Tailwind.

Visualización: Se integra la biblioteca React Flow para la representación gráfica de la ruta de aprendizaje.

API: Se utiliza Gemini API para la generación del mapa según el tema introducido.

Fase 05 (mayo)

Se procede a la realización de pruebas y ajustes de la aplicación:

Testing: Se realizan pruebas unitarias para comprobar el correcto funcionamiento de la aplicación.

Corrección de errores: Se corrigen los errores o bugs encontrados la aplicación para mejorar el MVP.

Despliegue a producción: Se despliega la aplicación para su uso.

Fase 06: Entrega final y Defensa (mayo)

Se termina la memoria técnica del proyecto y la documentación del código:

Memoria técnica: Se finaliza la memoria técnica del proyecto para su defensa más adelante.

Código fuente final: Se realizan los últimos cambios en el código para su publicación final.

Dirección web del proyecto: Se publica la dirección web de la aplicación desplegada para su uso.

Recursos multimedia: Se procede a la realización de una presentación para la defensa del proyecto.

Defensa ante el tribunal: Se procede a la defensa de la aplicación ante un tribunal con los recursos multimedia y la memoria técnica del proyecto.

Desarrollo del proyecto

Organización real del trabajo

(Describe las fases reales, cambios, problemas y ajustes).

Modelo de datos

(Inserta el Diagrama Entidad-Relación, modelo relacional y explicación de tablas).

Implementación y despliegue

(Describe tecnologías, estructura de carpetas, fragmentos clave de código, diagrama de despliegue y entorno de ejecución).

Fase de pruebas y control de calidad

Plan de pruebas

(Describe pruebas unitarias y de integración).

Registro de incidencias

(Inserta tabla con: Error, Fecha, Causa, Solución).

Validación final

(Análisis de cumplimiento de requisitos)

Conclusiones

Reflexión personal sobre el proyecto

Dificultades encontradas y resolución

Grado de cumplimiento de objetivos

Propuestas de mejora y evolución futura

Referencias y bibliografía

<Incluir las páginas web, bibliografías consultadas, referencias, citas, etc.>

(Lista ordenada de manuales, documentación técnica, normativa y recursos web).

Anexos

<Cualquier añadido se incluirá en este apartado.>

Manual de instalación

(Guía paso a paso para desplegar el sistema).

Manual de usuario

(Guía de uso para el usuario final)

Documentación complementaria digital

Ver Diagrama de Gantt en Completa Resolución

Anexos Técnicos y Documentales

(Anexo I, Anexo II... Para diagramas grandes, listados de código extensos, etc.).
