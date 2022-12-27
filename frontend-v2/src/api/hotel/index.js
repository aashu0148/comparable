import { errorToastLogger } from "utils/util.js";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getHotelSuggestions = async (query = "", connectionId) => {
  try {
    const reqUrl = `${backendApiUrl}/suggest/hotel?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
    });

    let data = await response.json();
    if (response.status > 300) {
      errorToastLogger(data, "Failed to get suggestions");
      return false;
    }
    return data;
  } catch (error) {
    errorToastLogger(error, "Failed to get suggestions");
    return false;
  }
};

export const getHotels = async (query = "", values, connectionId) => {
  try {
    const reqUrl = `${backendApiUrl}/hotel?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
    });

    let data = await response.json();
    if (response.status > 300) {
      errorToastLogger(data, "Failed to get hotels");
      return false;
    }
    return data;
  } catch (error) {
    errorToastLogger(error, "Failed to get hotels");
    return false;
  }
};
