# Calculadora de Salarios Médicos

Una aplicación web para calcular salarios de personal médico en formación basada en las tablas oficiales españolas.

## Características

- Selección de profesión (Facult. Formación o Enfermería)
- Selección de año de formación (1º a 5º año para médicos, 1º a 2º año para enfermería)
- Selección de número de pagas (12 o 14)
- Cálculo automático del salario base según las tablas oficiales
- Añadir guardias con fecha (solo para médicos, opcional)
- Máximo 7 guardias por mes
- Cálculo en tiempo real del salario total
- Interfaz moderna y responsiva

## Reglas de Guardias

- **Días laborables (L-V)**: 17 horas de guardia
- **Viernes**: 8 horas como Sábado + 9 horas laborables
- **Sábados**: 24 horas de guardia
- **Domingos**: 15 horas como Domingo + 9 horas laborables

## Tecnologías

- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Despliegue**: Vercel

## Instalación Local

```bash
npm install
cd client && npm install
cd ..
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3500`