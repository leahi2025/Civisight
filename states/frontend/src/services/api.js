// serves as communication bridge between frontend and backend

const API_URL = "http://127.0.0.1:8001/api"; // points to Django server

const api = {
    async get(endpoint) {
        try {
            console.log(`Making GET request to: ${API_URL}/${endpoint}`);
            const response = await fetch(`${API_URL}/${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            console.log(`Response status: ${response.status}`);
            
            // Add error handling
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`GET request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const url = `${API_URL}/${endpoint}`;
            console.log(`Making POST request to: ${url}`);
            console.log('Request data:', data);
            console.log('Request method: POST');
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            console.log(`Response status: ${response.status}`);
            console.log(`Response status text: ${response.statusText}`);
            console.log(`Response headers:`, response.headers);
            
            // Add error handling
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`POST request failed. Status: ${response.status}, Response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`POST request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    // Add base PUT method
    async put(endpoint, data) {
        try {
            const url = `${API_URL}/${endpoint}`;
            console.log(`Making PUT request to: ${url}`);
            console.log('Request data:', data);
            
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`PUT request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    // Add base DELETE method
    async delete(endpoint) {
        try {
            const url = `${API_URL}/${endpoint}`;
            console.log(`Making DELETE request to: ${url}`);
            
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            return response.ok;
        } catch (error) {
            console.error(`DELETE request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    // Form-related API calls
    forms: {
        // Create a new form
        async create(formData) {
            return api.post('forms/', formData);
        },

        // Get all forms
        async getAll() {
            return api.get('forms/');
        },

        // Get a specific form by ID
        async getById(formId) {
            return api.get(`forms/${formId}/`);
        },

        // Send reminder emails for a specific form
        async sendReminders(formId, userEmails) {
            return api.post(`forms/${formId}/remind/`, {
                user_emails: userEmails
            });
        },

        // Update a form
        async update(formId, formData) {
            return api.put(`forms/${formId}/`, formData);
        },

        // Remove a form 
        async remove(formId) {
            return api.delete(`forms/${formId}/`);
        }
    },

    // County-related API calls
    counties: {
        // Get all counties
        async getAll() {
            return api.get('counties/');
        },

        // Get a specific county by ID
        async getById(countyId) {
            return api.get(`counties/${countyId}/`);
        },

        // Get forms for a specific county
        async getForms(countyId) {
            return api.get(`counties/${countyId}/forms/`);
        },

        // Create a new county
        async create(countyData) {
            return api.post('counties/', countyData);
        },

        // Update a county
        async update(countyId, countyData) {
            return api.put(`counties/${countyId}/`, countyData);
        },

        // Remove a county
        async remove(countyId) {
            return api.delete(`counties/${countyId}/`);
        }
    },

    // State-related API calls
    states: {
        // Get all states
        async getAll() {
            return api.get('states/');
        },

        // Get a specific state by ID
        async getById(stateId) {
            return api.get(`states/${stateId}/`);
        },

        // Update a state
        async update(stateId, stateData) {
            return api.put(`states/${stateId}/`, stateData);
        },

        // Remove a state
        async remove(stateId) {
            return api.delete(`states/${stateId}/`);
        }
    }
};

export default api;