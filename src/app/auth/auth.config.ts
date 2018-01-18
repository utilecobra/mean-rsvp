import { ENV } from './../core/env.config';

interface AuthConfig {
  CLIENT_ID: string;
  CLIENT_DOMAIN: string;
  AUDIENCE: string;
  REDIRECT: string;
  SCOPE: string;
  NAMESPACE: string;
}

export const AUTH_CONFIG: AuthConfig = {
  CLIENT_ID: 'Q6MgfXiT4Z4nGjcSQdM5zSfs64HX1Vu0',
  CLIENT_DOMAIN: 'daisy-soft.eu.auth0.com',
  AUDIENCE: 'http://localhost:8083/api',
  REDIRECT: `${ENV.BASE_URI}/callback`,
  SCOPE: 'openid profile',
  NAMESPACE: 'http://myapp.com/roles'
};
