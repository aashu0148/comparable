const backendApiUrl = process.env.REACT_APP_BACKEND_URL;

export const getAnalytics = async () => {
  try {
    const reqUrl = `${backendApiUrl}/admin/get/analytics`;

    const response = await fetch(reqUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting analytics", error);
    return false;
  }
};
