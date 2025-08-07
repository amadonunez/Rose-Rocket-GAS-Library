# Rose Rocket GAS Library

Este es el repositorio de una biblioteca de Google Apps Script diseñada para facilitar la interacción con la API de Rose Rocket.

**Funcionalidad Principal:**
Esta biblioteca centraliza y simplifica las operaciones comunes con la API de Rose Rocket, proporcionando un conjunto de funciones reutilizables que pueden ser utilizadas por otros proyectos de Google Apps Script. Su objetivo es evitar la duplicación de código y asegurar una gestión eficiente y segura de las solicitudes a la API.

**Características Clave:**
-   **Gestión de Autenticación:** Incluye funciones para obtener y gestionar tokens de acceso para diferentes instancias de Rose Rocket. Utiliza `PropertiesService` para almacenar de forma segura las credenciales (nombre de usuario, contraseña, ID de cliente, secreto de cliente) y maneja la caducidad y el refresco de los tokens.
-   **Consulta de Órdenes por ID:** Permite recuperar los detalles de una orden específica de Rose Rocket utilizando su ID de orden. Incluye manejo de errores para diferentes respuestas de la API.
-   **Búsqueda de Órdenes:** Ofrece una función robusta para buscar y recuperar múltiples órdenes de Rose Rocket basándose en parámetros de consulta. Maneja automáticamente la paginación para asegurar que se obtengan todos los resultados relevantes.
-   **Reutilización de Código:** Proporciona una capa de abstracción para la API de Rose Rocket, permitiendo que otros proyectos de Apps Script integren fácilmente funcionalidades de Rose Rocket sin necesidad de reimplementar la lógica de autenticación y las llamadas a la API.

**Uso:**
Esta biblioteca está diseñada para ser incluida como una dependencia en otros proyectos de Google Apps Script. Las funciones expuestas permiten a los desarrolladores interactuar con la API de Rose Rocket de manera segura y eficiente.