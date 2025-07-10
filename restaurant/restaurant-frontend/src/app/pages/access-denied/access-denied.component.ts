import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  template: `
    <div style="text-align:center; margin-top: 100px;">
      <h2>⛔ Accès refusé</h2>
      <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
    </div>
  `
})
export class AccessDeniedComponent {}
