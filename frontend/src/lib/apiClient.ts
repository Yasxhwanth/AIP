// C3 AIP - Enterprise Frontend API Client

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let sessionToken: string | null = null;
if (typeof window !== 'undefined') {
    sessionToken = sessionStorage.getItem('aip_token');
}

async function getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    // 1. Bearer Token (Highest Priority)
    if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        return headers;
    }

    // 2. Explicit API Key defined in Frontend
    const envApiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (envApiKey) {
        headers['x-api-key'] = envApiKey;
        return headers;
    }

    // 3. Fallback Auth Bootstrap (Development Sandbox)
    // If no explicit keys exist, we fetch a temporary developer token from the backend
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'test-api-key' },
            body: JSON.stringify({ userId: 'dev-user', role: 'admin' })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                sessionToken = data.token;
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('aip_token', data.token);
                }
                headers['Authorization'] = `Bearer ${sessionToken}`;
                return headers;
            }
        }
    } catch {
        // Fallback silently if auth endpoint unreachable
    }

    // 4. Ultimate Fallback for Local Dev Server without auth requirements setup
    headers['x-api-key'] = 'test-api-key';
    return headers;
}

export class ApiClient {

    static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) url.searchParams.append(key, value);
            });
        }

        const headers = await getHeaders();

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error [GET ${endpoint}]: ${response.status} - ${errText}`);
        }

        return response.json() as Promise<T>;
    }

    static async post<T>(endpoint: string, data: any): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const headers = await getHeaders();

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error [POST ${endpoint}]: ${response.status} - ${errText}`);
        }

        return response.json() as Promise<T>;
    }

    static async put<T>(endpoint: string, data: any): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const headers = await getHeaders();

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error [PUT ${endpoint}]: ${response.status} - ${errText}`);
        }

        return response.json() as Promise<T>;
    }

    static async delete<T>(endpoint: string): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const headers = await getHeaders();

        const response = await fetch(url, {
            method: 'DELETE',
            headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error [DELETE ${endpoint}]: ${response.status} - ${errText}`);
        }

        return response.json() as Promise<T>;
    }
}
