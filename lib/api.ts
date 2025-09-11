import axios from "axios";

function createAxiosClient() {
  return async function (method:string, endpoint:string, body?:any, isFormData = false) {
    const url = process.env.NODE_ENV === "production"
  ? process.env.NEXT_PUBLIC_API_URL + (endpoint ? endpoint : "")
  : process.env.NEXT_PUBLIC_DEV_API_URL + (endpoint ? endpoint : "");

    const config = {
      method,
      url,
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
      withCredentials: true,
      data: body,
    };

    try {
      const response = await axios(config);
      return {
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        ...response.data,
      };
    } catch (error:any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  };
}

export const apiClient = createAxiosClient();
