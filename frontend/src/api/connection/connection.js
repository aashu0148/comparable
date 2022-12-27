import { errorToastLogger, getEncryptedAuthorizationHeader } from "util.js";

const backendApiUrl = process.env.REACT_APP_BACKEND_URL;

export const getConnection = async () => {
  try {
    const reqUrl = `${backendApiUrl}/connect`;

    const encrypt = getEncryptedAuthorizationHeader(reqUrl.slice(-10));
    const response = await fetch(reqUrl, {
      headers: {
        backendOrigin: backendApiUrl,
        authorization: encrypt,
      },
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error making connection");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error making connection"
      );
      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get connection");
    return false;
  }
};
