--Gestor de Presupuestos Jerárquico--

Aplicación móvil/web construida con Expo + React Native que permite crear, editar y visualizar un presupuesto jerárquico (categorías y subcategorías), con cálculo automático de totales, visualización gráfica, historial de cambios, exportación y soporte de temas (claro / oscuro / automático).

--Características principales--

-Árbol de presupuesto jerárquico

Categorías y subcategorías ilimitadas

Totales calculados automáticamente

Edición inline de nombres y montos

Colapsar / expandir nodos

--Visualización gráfica

Gráfica de pastel (donut)

Navegación por niveles (drill-down)

Colores generados automáticamente

Leyendas dinámicas

--Persistencia local--

Guardado automático con debounce

Historial de presupuestos

Restauración de versiones anteriores

Favoritos en el historial

--Exportación--

Exportar a CSV

Exportar a PDF

Compatible con Web y Expo Go (Android / iOS)

--Temas--

Modo claro

Modo oscuro

Modo automático (según sistema)

Persistencia del tema seleccionado

--Navegación--

Navegación simple sin librerías externas

Pantalla Home

Pantalla Historial

--Arquitectura del proyecto--

src/
├── data/                     # Capa de datos
│   ├── datasources/
│   │   └── BudgetLocalDatasource.ts
│   ├── mappers/
│   │   └── BudgetMapper.ts
│   ├── models/
│   │   └── BudgetModel.ts
│   ├── repositories_impl/
│   │   └── BudgetRepositoryImpl.ts
│   └── storage/
│       └── BudgetStorage.ts
│
├── domain/                   # Capa de dominio (reglas de negocio)
│   ├── entities/
│   │   └── BudgetNode.ts
│   ├── repositories/
│   │   └── BudgetRepository.ts
│   └── usecases/
│       ├── CalculateTotalUseCase.ts
│       ├── GetPieChartDataUseCase.ts
│       ├── LoadBudgetUseCase.ts
│       └── SaveBudgetUseCase.ts
│
├── navigation/
│   └── AppNavigation.tsx     # Navegación manual (stack propio)
│
├── presentation/             # UI / UX
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── AppText.tsx
│   │   │   ├── ChartTitle.tsx
│   │   │   ├── LegendItem.tsx
│   │   │   └── SafeArea.tsx
│   │   ├── molecules/
│   │   │   ├── BudgetItemRow.tsx
│   │   │   ├── BudgetPieChart.tsx
│   │   │   └── PieChartLegend.tsx
│   │   └── organisms/
│   │       └── BudgetTree.tsx
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── HistoryScreen.tsx
│   │
│   ├── styles/
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useThemeContext.tsx
│   │   └── budgetStyles.ts
│   │
│   ├── utils/
│   │   ├── budgetTreeUtils.ts
│   │   ├── colorFromId.ts
│   │   ├── exportBudgetToCSV.ts
│   │   └── exportBudgetToPdf.ts
│   │
│   └── viewmodels/
│       └── BudgetTreeViewModel.ts
│
├── App.tsx                   # Punto de entrada
├── index.ts
├── app.json
├── package.json
└── tsconfig.json


--Conceptos clave--

BudgetNode

Entidad principal del dominio

Representa un nodo del presupuesto

UseCases

Lógica de negocio aislada

Cálculo de totales

Generación de datos para gráficas

Guardado y carga

Storage

Persistencia con AsyncStorage

Historial y favoritos

ViewModels / Utils

Manipulación inmutable del árbol

Búsqueda, actualización y eliminación de nodos

--Funcionalidades evaluables (ideal para calificación)

-Uso de arquitectura limpia

-Separación dominio / datos / presentación

-Uso de AsyncStorage

-Casos de uso bien definidos

-Componentes reutilizables (atoms / molecules / organisms)

-Manejo de estado local

-Exportación de datos

-Modo oscuro / claro

-Código comentado y legible

"Autor"

Víctor Manuel Aranda Rodríguez
Proyecto académico / práctico con Expo + React Native
