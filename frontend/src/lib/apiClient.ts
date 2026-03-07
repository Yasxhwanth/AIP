// C3 AIP - Enterprise Frontend API Client

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let sessionToken: string | null = null;
if (typeof window !== 'undefined') {
    sessionToken = sessionStorage.getItem('aip_token');
}

let activeProjectId: string | null = null;
if (typeof window !== 'undefined') {
    activeProjectId = localStorage.getItem('aip_active_project_id');
}

async function getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (activeProjectId) {
        headers['X-Project-Id'] = activeProjectId;
    }

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

    // If no token or API key is found, do not attach an auth header. The backend will return 401.
    return headers;
}

export class ApiClient {
    static setProjectId(id: string) {
        activeProjectId = id;
    }

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
