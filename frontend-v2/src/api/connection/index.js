import {
  errorToastLogger,
  getEncryptedAuthorizationHeader,
} from "utils/util.js";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getConnection = async () => {
  try {
    const reqUrl = `${backendApiUrl}/connect`;

    const encrypted = getEncryptedAuthorizationHeader(reqUrl.slice(-10));
    const response = await fetch(reqUrl, {
      headers: {
        backendOrigin: backendApiUrl,
        authorization: encrypted,
      },
    });
    let data = await response.json();
    if (response.status > 300) {
      errorToastLogger(data, "Failed to get connection");
      return false;
    }
    return data;
  } catch (error) {
    errorToastLogger(error, "Failed to get connection");
    return false;
  }
};
