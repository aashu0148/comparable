import { errorToastLogger } from "utils/util.js";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getEcomerceProducts = async (
  query = "",
  sort,
  requestedFrom = [],
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/ecomerce?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        requestedFrom,
        sort,
      }),
    });

    let data = await response.json();
    if (response.status > 300) {
      errorToastLogger(data, "Failed to get products");
      return false;
    }
    return data;
  } catch (error) {
    errorToastLogger(error, "Failed to get products");
    return false;
  }
};

export const getEcomerceProductSuggestions = async (
  query = "",
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/suggest/ecomerce?search=${query.toLowerCase()}`;
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
