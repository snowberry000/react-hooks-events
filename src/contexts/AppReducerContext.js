import React from "react";
import { bookings } from "../models/bookings";
import bookingsReducer from "../reducers/bookingsReducer";
import settingsReducer from "../reducers/settingsReducer";
import customersReducer from "../reducers/customersReducer";
import authReducer from "../reducers/authReducer";

const AppReducerContext = React.createContext(null);

const initialState = {
  bookings: [],
  settings: {
    companyLoading: false,
    companyInfo: {
      name: "",
      vatId: "",
      street: "",
      city: "",
      postCode: "",
      phone: "",
      currency: "",
      vatRate: "",
    },
    bookingStatuses: [],
    enableBookingSection: true,
    bookingStatusLoading: false,
    bookingStatusActionLoading: false,

    venues: [],
    loading: false,
    selectedVenueSpaces: [],
    venuesLoading: false,       
    venueActionLoading: false,
    spacesLoading: false, 
    spaceActionLoading: false,
  },
  customers: [],
  auth: {
    isAuthenticated: false,
    showInvalidMsg: false,
    loading: true,
    user: {
      email: "",
      password: ""
    },
    token: localStorage.getItem('token'),
  },
};

const reducer = combineReducers({
  settings: settingsReducer,
  bookings: bookingsReducer,
  customers: customersReducer,
  auth: authReducer,
});

function combineReducers(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, {});
  };
}

// state selectors

function statusesNameAndColors(state) {
  const statuses = state.settings.bookingStatuses.filter(
    s => (s.enabled === undefined || s.enabled === true) && s.name.length > 0
  );
  const bookingStatesNames = statuses.map(s => s.name);
  const bookingStatesColors = statuses.map(s => s.color || "grey");

  return [bookingStatesNames, bookingStatesColors];
}

export { AppReducerContext, statusesNameAndColors, reducer, initialState };
