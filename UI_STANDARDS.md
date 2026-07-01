# 🏛️ Guía de Estándares Arquitectónicos y UI/UX (Money Trees)

Este documento define las directrices y estándares obligatorios para mantener una única coherencia visual, de experiencia de usuario (UX) y de lógica funcional en todos los módulos de **Money Trees**. Toda nueva pantalla, refactorización o funcionalidad debe ceñirse rigurosamente a estos patrones.

---

## 1. 📅 Navegador de Mes y Fecha (`tx-month-nav`)

Para cualquier módulo que requiera navegar o filtrar información por mes y año (Flujo de Caja, Presupuestos, Reportes, etc.), **está estrictamente prohibido crear barras o botones de navegación diferentes**. Se debe utilizar siempre el componente estándar:

```jsx
<div className="tx-month-nav">
  <button onClick={goToPreviousMonth} className="tx-month-nav__btn" aria-label="Mes anterior">
    ←
  </button>
  <div className="tx-month-nav__current" onClick={goToCurrentMonth} title="Volver al mes actual">
    <span className="tx-month-nav__month">{MONTH_NAMES[month - 1]}</span>
    <span className="tx-month-nav__year">{year}</span>
  </div>
  <button onClick={goToNextMonth} className="tx-month-nav__btn" aria-label="Mes siguiente">
    →
  </button>
</div>
```

**Comportamiento:**
- Los botones `←` y `→` retroceden o avanzan un mes.
- Al hacer clic en el texto central (`Mes Año`), el sistema retorna inmediatamente al mes en curso (`goToCurrentMonth`).

---

## 2. ⚡ Carga Dinámica y Fricción Cero (Sin Parpadeo de Pantalla)

Cuando el usuario navega entre pestañas, cambia de mes o filtra transacciones/presupuestos:
- **NUNCA** se debe desmontar el contenedor principal ni ocultar el encabezado (`page-header`), las pestañas de filtro (`filter-btn`) o el navegador de fecha (`tx-month-nav`) reemplazándolos con una pantalla de carga global (`loading-screen`).
- La carga o actualización de datos **debe ser localizada** dentro de la sección específica de lista o cuadrícula (`tx-list` o `accounts-grid`):

```jsx
{loading ? (
  <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
    Cargando datos...
  </div>
) : data.length === 0 ? (
  <div className="empty-state">...</div>
) : (
  <div className="accounts-grid">...</div>
)}
```
Esto garantiza una experiencia tipo SPA ultra fluida y reactiva en todos los módulos.

---

## 3. 🏷️ Encabezados y Pestañas de Filtro (`filter-btn`)

- **Encabezados:** Todos los módulos usan la clase wrapper `.page-header` con `.page-header__row`, `.page-header__title` y `.page-header__action` para el botón principal de "+ Nuevo".
- **Pestañas (Tabs) o Categorización:** Siempre utilizar botones tipo cápsula con la clase `.filter-btn`:

```jsx
<div className="categories-filters">
  <button
    onClick={() => setActiveTab('tab1')}
    className={`filter-btn ${activeTab === 'tab1' ? 'filter-btn--active' : ''}`}
  >
    Opción 1
  </button>
</div>
```

---

## 4. 📝 Formulario y Ventanas Modales (`entity-form`)

- Todo formulario dentro de una modal o página debe utilizar las clases oficiales neumórficas:
  - Wrapper: `.entity-form`
  - Campos: `.entity-form__field` + `.entity-form__label` + `.entity-form__input` / `.entity-form__select`
  - Botones de acción: `.entity-form__actions` + `.entity-form__btn--primary` / `.entity-form__btn--secondary`
- Las ventanas emergentes deben construirse con el componente `<Modal animation="top" | "bottom">`.
