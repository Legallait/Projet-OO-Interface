<template>
  <footer class="footer">
    <div class="content">
      <div class="about">
        <h2>CinéClic</h2>
        <p>
          Votre cinémathèque de poche, libre et instantanée. Collectionnez, organisez et explorez vos
          œuvres préférées directement dans votre navigateur.
        </p>
      </div>

      <div class="column">
        <h3>Navigation</h3>
        <RouterLink to="/">Explorer les films</RouterLink>
        <RouterLink to="/library">Ma bibliothèque</RouterLink>
        <RouterLink to="/favorites">Mes favoris</RouterLink>
      </div>

      <div class="column">
        <h3>Philosophie</h3>
        <span>Données locales (LocalStorage)</span>
        <span>Pas de pistage publicitaire</span>
        <span>100% gratuit</span>
      </div>

      <div class="credits">
        <span class="tickets">Billets sans contact</span>
        <span>CinéClic © 2026 </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  padding: 56px 40px;
  background: var(--footer-bg);
  color: var(--cream);
}

.footer::before,
.footer::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  background: repeating-linear-gradient(to right, transparent 0 24px, var(--cream) 24px 38px, transparent 38px 56px);
}

.footer::before {
  top: 10px;
}

.footer::after {
  bottom: 10px;
}

.content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 32px 64px;
}

.about {
  flex: 1 1 320px;
  max-width: 420px;
}

h2 {
  margin: 0 0 12px;
  font-family: var(--display);
  font-size: 1.4rem;
  color: var(--gold);
}

p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.9rem;
}

h3 {
  margin: 0 0 4px;
  font-family: var(--display);
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--gold);
}

a {
  color: var(--cream);
  text-decoration: none;
}

a:hover {
  color: var(--gold);
}

.credits {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-left: auto;
  padding-top: 32px;
  font-size: 0.8rem;
}

.tickets {
  font-family: var(--display);
  text-transform: uppercase;
  color: var(--gold);
}

@media (max-width: 700px) {
  .footer {
    padding: 48px 16px;
  }

  .credits {
    align-items: flex-start;
    margin-left: 0;
    padding-top: 0;
  }
}
</style>
