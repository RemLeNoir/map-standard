# Contribuir

La superficie de contribución principal es la **librería de maps**. Si tienes un
arquetipo de tarea útil (no de dominio), aporta su map.

## Añadir un map

1. Crea `src/core/maps/<id>.ts` con `defineMap({...})`.
2. Regístralo en `src/core/maps/index.ts`.
3. Que sea un **arquetipo de tarea**, no un vertical. El dominio lo pone el usuario
   ajustando `ragScope.include`.
4. Presupuesto realista: el tier más barato que haga el trabajo.
5. `npm run typecheck` y `npm run lint` en verde.

## Reglas de oro

- Nada de fases, MVP ni "ya lo iteramos". El map se define completo o no entra.
- El map enforza por código. Si tu propuesta solo "sugiere", no es MAP.
- Si tu cambio toca la gateway para una capacidad nueva, casi seguro que en
  realidad es un map nuevo.
