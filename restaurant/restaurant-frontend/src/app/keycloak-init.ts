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
        onLoad: 'login-required',
        checkLoginIframe: false,
        redirectUri: window.location.origin,
        flow: 'standard',
        pkceMethod: 'S256'
      },
      bearerExcludedUrls: ['/assets', '/clients/public'],
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer'
    }).then(authenticated => {
      if (authenticated) {
        console.log('✅ Keycloak authentication successful');
        return true;
      } else {
        console.log('❌ Keycloak authentication failed');
        return false;
      }
    }).catch(error => {
      console.error('🚨 Keycloak initialization failed:', error);
      // Don't block the app, just log the error
      return false;
    });
}
