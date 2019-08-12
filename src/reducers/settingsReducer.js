import uuidV4 from "../utils/uuidV4";
import reorder from "../utils/reorder";
import spacesColors from "../models/spacesColors";

import {
  REQUEST_GET_VENUE,
  GET_VENUE_SUCCESS,
  GET_VENUE_ERROR,
  REQUEST_ADD_VENUE,
  GET_ADD_VENUE_SUCCESS,
  GET_ADD_VENUE_ERROR,
  REQUEST_DELETE_VENUE,
  GET_DELETE_VENUE_SUCCESS,
  GET_DELETE_VENUE_ERROR,
  REQUEST_EDIT_VENUE,
  GET_EDIT_VENUE_SUCCESS,
  GET_EDIT_VENUE_ERROR,
  REQUEST_GET_VENUE_SPACES,
  GET_VENUE_SPACES_SUCCESS,
  GET_VENUE_SPACES_ERROR,
  REQUEST_ADD_VENUE_SPACE,
  GET_ADD_VENUE_SPACE_SUCCESS,
  GET_ADD_VENUE_SPACE_ERROR,
  REQUEST_EDIT_VENUE_SPACE,
  GET_EDIT_VENUE_SPACE_SUCCESS,
  GET_EDIT_VENUE_SPACE_ERROR,
  REQUEST_DELETE_VENUE_SPACE,
  GET_DELETE_VENUE_SPACE_SUCCESS,
  GET_DELETE_VENUE_SPACE_ERROR,
} from "./actionType";

function settingsReducer(state = {}, action) {
  switch (action.type) {
    case "update_settings_value": {
      const key = action.key;
      const value = action.value;
      return {
        ...state,
        [key]: value
      };
    }
    case "update_settings_default_vat_rate": {
      return {
        ...state,
        defaultVatRateText: action.value,
        defaultVatRate: parseFloat(action.value)
      };
    }
    case "toggle_custom_status": {
      const bookingStatuses = Array.from(state.bookingStatuses);
      bookingStatuses[action.index].enabled = !bookingStatuses[action.index]
        .enabled;

      return {
        ...state,
        bookingStatuses
      };
    }
    case "update_custom_status_name": {
      const bookingStatuses = Array.from(state.bookingStatuses);
      bookingStatuses[action.index].name = action.name;

      return {
        ...state,
        bookingStatuses
      };
    }
    case "remove_custom_status": {
      const bookingStatuses = Array.from(state.bookingStatuses);
      bookingStatuses.splice(action.index, 1);

      return {
        ...state,
        bookingStatuses
      };
    }
    case "append_custom_status": {
      const bookingStatuses = Array.from(state.bookingStatuses);
      bookingStatuses.push({
        id: uuidV4(),
        name: "",
        type: "custom",
        enabled: true
      });

      return {
        ...state,
        bookingStatuses
      };
    }
    case "reorder_status": {
      const bookingStatuses = reorder(
        state.bookingStatuses,
        action.from,
        action.to
      );
      return {
        ...state,
        bookingStatuses
      };
    }

    // VENUES AND SPACES
    case REQUEST_GET_VENUE: {
      return {
        ...state,
        loading: true,
      }
    }
    case GET_VENUE_SUCCESS: {
      return {
        ...state,
        loading: false,
        venues: [
          ...action.payload
        ]
      }
    }
    case GET_VENUE_ERROR: {
      return {
        ...state,
        loading: false,
        venues: [],
      }
    }
    case REQUEST_ADD_VENUE: {
      return {
        ...state,
        venueActionLoading: true,
      }
    }
    case GET_ADD_VENUE_SUCCESS: {
      return {
        ...state,
        venueActionLoading: false,
        venues: [
          ...state.venues,
          action.payload
        ]
      }
    }
    case GET_ADD_VENUE_ERROR: {
      return {
        ...state,
        venueActionLoading: false,
      }
    }
    case REQUEST_DELETE_VENUE: {
      return {
        ...state,
        venueActionLoading: true,
      }
    }
    case GET_DELETE_VENUE_SUCCESS: {
      return {
        ...state,
        venueActionLoading: false,
        venues: [...state.venues.filter(item => item.id !== action.payload)]
      }
    }
    case GET_DELETE_VENUE_ERROR: {
      return {
        ...state,
        venueActionLoading: false,
      }
    }
    case REQUEST_EDIT_VENUE: {
      return {
        ...state,
        venueActionLoading: true,
      }
    }
    case GET_EDIT_VENUE_SUCCESS: {
      return {
        ...state,
        venueActionLoading: false,
        venues: [
          ...state.venues.map(item => {
            if (item.id === action.payload.id)
              item.name = action.payload.name;
            return item;
          })
        ]
      }
    }
    case GET_EDIT_VENUE_ERROR: {
      return {
        ...state,
        venueActionLoading: false,
      }
    }
    case REQUEST_GET_VENUE_SPACES: {
      return {
        ...state,
        spacesLoading: true,
      }
    }
    case GET_VENUE_SPACES_SUCCESS: {
      return {
        ...state,
        spacesLoading: false,
        selectedVenueSpaces: [...action.payload]
      }
    }
    case GET_VENUE_SPACES_ERROR: {
      return {
        ...state,
        spacesLoading: false,
        selectedVenueSpaces: [],
      }
    }
    case REQUEST_ADD_VENUE_SPACE: {
      return {
        ...state,
        spaceActionLoading: true,
      }
    }
    case GET_ADD_VENUE_SPACE_SUCCESS: {
      return {
        ...state,
        spaceActionLoading: false,
        selectedVenueSpaces: [...state.selectedVenueSpaces, action.payload]
      }
    }
    case GET_ADD_VENUE_SPACE_ERROR: {
      return {
        ...state,
        spaceActionLoading: false,
      }
    }
    case REQUEST_EDIT_VENUE_SPACE: {
      return {
        ...state,
        spaceActionLoading: true,
      }
    }
    case GET_EDIT_VENUE_SPACE_SUCCESS: {
      return {
        ...state,
        spaceActionLoading: false,
        selectedVenueSpaces: [
          ...state.selectedVenueSpaces.map(item => {
            if (item.id === action.payload.id)
              item.name = action.payload.name;
            return item;
          })
        ]
      }
    }
    case GET_EDIT_VENUE_SPACE_ERROR: {
      return {
        ...state,
        spaceActionLoading: false,
      }
    }
    case REQUEST_DELETE_VENUE_SPACE: {
      return {
        ...state,
        spaceActionLoading: true,
      }
    }
    case GET_DELETE_VENUE_SPACE_SUCCESS: {
      return {
        ...state,
        spaceActionLoading: false,
        selectedVenueSpaces: state.selectedVenueSpaces.filter(item => item.id !== action.payload)
      }
    }
    case GET_DELETE_VENUE_SPACE_ERROR: {
      return {
        ...state,
        spaceActionLoading: false,
      }
    }
    case "add_venue": {
      return {
        ...state,
        venues: [
          { id: uuidV4(), name: action.name, spaces: [] },
          ...state.venues
        ]
      };
    }
    case "edit_venue": {
      const newState = { ...state };
      newState.venues[action.index].name = action.name;
      return newState;
    }
    case "delete_venue": {
      const newState = { ...state };
      newState.venues.splice(action.index, 1);
      return newState;
    }
    case "add_space": {
      const randomColor =
        spacesColors[Math.floor(Math.random() * spacesColors.length)];

      const newState = { ...state };
      const spaces = newState.venues[action.venue].spaces;
      newState.venues[action.venue].spaces = [
        { name: action.name, id: uuidV4(), accentColor: randomColor },
        ...spaces
      ];
      return newState;
    }
    case "edit_space": {
      const newState = { ...state };
      newState.venues[action.venue].spaces[action.space].name = action.name;
      return newState;
    }
    case "delete_space": {
      const newState = { ...state };
      newState.venues[action.venue].spaces.splice(action.space, 1);
      return newState;
    }

    default:
      return state;
  }
}

export default settingsReducer;
