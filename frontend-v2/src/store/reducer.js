import actionTypes from "./actionTypes";

const initialState = {
  mobileView: false,
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_MOBILE_VIEW: {
      return { ...state, mobileView: action.isMobileView ? true : false };
    }

    default:
      return state;
  }
};

export default rootReducer;
