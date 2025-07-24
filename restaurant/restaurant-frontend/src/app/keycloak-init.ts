import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'myrealm',
        clientId: 'myclient'
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
        redirectUri: window.location.href, // Use full URL to preserve current page
        flow: 'standard',
        pkceMethod: 'S256'
      },
      bearerExcludedUrls: ['/assets', '/clients/public', '/login', '/sign-in', '/register', '/registration-success', '/access-denied'],
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer'
    }).then(authenticated => {
      // Always return true to allow the app to start, regardless of authentication status
      return true;
    }).catch(error => {
      // Don't block the app, just log the error
      return true;
    });
}
