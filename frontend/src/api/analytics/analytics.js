import { errorToastLogger, getEncryptedAuthorizationHeader } from "util.js";

const backendApiUrl = process.env.REACT_APP_BACKEND_URL;

export const platformAnalytics = async (platform, connectionId) => {
  try {
    const reqUrl = `${backendApiUrl}/analytic/link-click?from=${platform}`;

    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
    });

    if (response.status !== 200) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};
