import api from "./client";

export const getProperties = (params: any) => api.get("/properties", { params });
export const getProperty = (id: string) => api.get(`/properties/${id}`);
export const createProperty = async (data: FormData) => {
  try {
    const response = await api.post("/properties", data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000, 
    });
    return response;
  } catch (error: any) {
   
    console.error("API error in createProperty:", error);
    throw error;
  }
};
export const updateProperty = (id: string, data: any) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id: string) => api.delete(`/properties/${id}`);
export const toggleFavorite = (propertyId: string) => api.post("/favorites", { propertyId });
export const getFavorites = () => api.get("/favorites");
export const createReport = (propertyId: string, reportedUserId: string | null, reason: string) => api.post("/reports", { propertyId, reportedUserId, reason });
