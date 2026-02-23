// C3 AIP - Enterprise Frontend API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// We simulate an authenticated enterprise environment by pre-supplying a mock token,
// but in reality, this would be fetched from a secure local storage or session cookie.
// Since the Express backend only expects API Keys right now (or headers), we configure it here.
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    // In a real environment, this would be `Authorization: Bearer ${token}`
    // Looking at the Express backend auth, it uses `x-api-key` or `Authorization: Bearer <jwt>`.
    // We'll let the user provide a token via an environment variable if needed, or bypass for local dev.
};

export class ApiClient {

    static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) url.searchParams.append(key, value);
            });
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: DEFAULT_HEADERS,
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

        const response = await fetch(url, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
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

        const response = await fetch(url, {
            method: 'PUT',
            headers: DEFAULT_HEADERS,
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

        const response = await fetch(url, {
            method: 'DELETE',
            headers: DEFAULT_HEADERS,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error [DELETE ${endpoint}]: ${response.status} - ${errText}`);
        }

        return response.json() as Promise<T>;
    }
}
