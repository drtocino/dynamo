import { environment } from '../../../environments/environment';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const windowOverride = (window as any).__DYNAMO_API_URL__;
    if (windowOverride && typeof windowOverride === 'string' && windowOverride.trim()) {
      return windowOverride.trim().replace(/\/+$/, '');
    }

    try {
      const localOverride = localStorage.getItem('dynamo_api_url');
      if (localOverride && localOverride.trim()) {
        return localOverride.trim().replace(/\/+$/, '');
      }
    } catch (_) {}
  }

  return (environment.apiBaseUrl || 'http://localhost:5000').replace(/\/+$/, '');
}

export function getApiUrl(): string {
  return `${getApiBaseUrl()}/api/v1`;
}

export function getSessionHubUrl(): string {
  return `${getApiBaseUrl()}/hubs/session`;
}

export function getGameHubUrl(): string {
  return `${getApiBaseUrl()}/hub/game`;
}
