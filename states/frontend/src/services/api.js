const API_URL = "http://127.0.0.1:8001/api";

const api = {
    async get(endpoint) {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        // Add error handling
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        // Add error handling
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
};

export default api;