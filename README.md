# Gestión de proyectos

Aplicación móvil de gestión de tareas, proyectos y categorías construida con Expo y React Native.

## Pruebas de componentes

Las pruebas usan Jest con el preset `jest-expo` y React Native Testing Library (RNTL). RNTL renderiza los componentes en un entorno de prueba y permite interactuar con ellos como lo haría una persona, consultando textos y placeholders y pulsando controles.

### Configuración realizada

1. Se instalaron las dependencias de desarrollo compatibles con el SDK 57 de Expo:

   ```bash
   npx expo install jest-expo jest @testing-library/react-native --dev
   ```

2. Se configuró `jest-expo` como preset de Jest en `package.json` y se agregó el script `test` para ejecutar la suite.

3. Se creó `jest.setup.js` para sustituir el selector nativo `Picker` por componentes de texto y vista durante las pruebas. Así se comprueba la pantalla sin depender de un módulo nativo fuera del dispositivo.

4. Se añadieron pruebas aisladas para cada pantalla dentro de `src/components/__tests__/`. Los servicios de autenticación y API se simulan con mocks: las pruebas no necesitan conexión a la API ni cambios en la base de datos. Se comprueban renderizado, estados vacíos, validaciones, navegación y el envío correcto de credenciales.

5. En RNTL 14, `render` y `fireEvent` son asíncronos, por eso se usa `await`; `waitFor` espera los efectos que dependen de respuestas simuladas de la API. Esto evita consultar la pantalla antes de que termine de renderizar o de actualizar su estado.

No se instaló `react-test-renderer`: la documentación de Expo lo considera obsoleto y no compatible con React 19; RNTL se encarga del renderizado de componentes.

### Ejecutar las pruebas

```bash
# Ejecutar toda la suite una vez
npm test -- --runInBand

# Ejecutar una pantalla específica
npm test -- --runInBand src/components/__tests__/LoginScreen.test.js

# Modo interactivo para desarrollo
npm test -- --watch
```

`--runInBand` ejecuta las pruebas en un único proceso, útil para una salida más clara en entornos de desarrollo y CI.