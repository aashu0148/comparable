import { availableSortOptions, availableFilterOptions } from "constants.js";
import { errorToastLogger } from "util.js";

const backendApiUrl = process.env.REACT_APP_BACKEND_URL;

export const getSuggestions = async (query = "", connectionId) => {
  try {
    const reqUrl = `${backendApiUrl}/suggest/ecomerce?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error getting suggestion results");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error getting suggestion results"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get suggestions");
    return false;
  }
};

export const getGeneralProducts = async (
  query = "",
  sort,
  filters,
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/compute/general?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sort,
        filters,
      }),
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error getting general product results");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error getting general product results"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get general products data");
    return false;
  }
};

export const getFashionProducts = async (
  query = "",
  sort,
  filters,
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/compute/fashion?search=${query.toLowerCase()}`;

    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sort,
        filters,
      }),
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error getting fashion product results");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error getting fashion product results"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get fashion products data");
    return false;
  }
};

export const getElectronicProducts = async (
  query = "",
  sort,
  filters,
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/compute/electronics?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sort,
        filters,
      }),
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error getting electronic product results");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error getting electronic product results"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get electronic products data");
    return false;
  }
};

export const getCustomProducts = async (
  query = "",
  sort,
  filters,
  requestedFrom,
  connectionId
) => {
  try {
    const reqUrl = `${backendApiUrl}/compute/custom?search=${query.toLowerCase()}`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sort,
        filters,
        requestedFrom,
      }),
    });

    if (response?.status !== 200) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Error getting custom product results");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error getting custom product results"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "Failed to get custom products data");
    return false;
  }
};

export const sendFeedback = async (email, feedback, priority, connectionId) => {
  try {
    const reqUrl = `${backendApiUrl}/feedback/create`;
    const response = await fetch(reqUrl, {
      headers: {
        authorization: connectionId,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email,
        feedback,
        priority: parseInt(priority),
      }),
    });

    if (response?.status > 300) {
      let parsedResponse = {};
      try {
        parsedResponse = await response.json();
      } catch (err) {
        errorToastLogger("", "Unable to send feedback");
        return false;
      }

      errorToastLogger(
        "",
        parsedResponse?.message || "Error in sending feedback"
      );

      return false;
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    errorToastLogger(error, "something went wrong");
    return false;
  }
};
