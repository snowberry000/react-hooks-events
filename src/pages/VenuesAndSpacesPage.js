import { css } from "emotion";
import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { AppReducerContext } from "../contexts/AppReducerContext";
import Button from "../components/buttons/Button";
import colors from "../components/style/Colors";
import { TableEditableValue } from "../components/tables/Tables";
import H3 from "../components/typography/H3";
import P1 from "../components/typography/P1";
import ColoredDot from "../components/buttons/ColoredDot";
import SpinnerContainer from "../components/layout/Spinner"
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
} from "../reducers/actionType";

const VenuesAndSpacesPage = props => {
  const { state, dispatch } = props;
  const [addingVenue, setAddingVenue] = useState(false);
  const [addingSpace, setAddingSpace] = useState(false);
  const [selectedVenueIndex, setSelectedVenueIndex] = useState(null);

  const getSelectedVenue = (selectedId) => {
    const filteredVenue = state.venues.filter(item => item.id === selectedId)
    if (filteredVenue.length > 0)
      return filteredVenue[0];
    else return [];
  }

  const selectedVenue = selectedVenueIndex !== null && getSelectedVenue(selectedVenueIndex);

  useEffect(() => {

    const getVenue = async () => {
      try {
        dispatch({ type: REQUEST_GET_VENUE });

        const res = await axios.get('/venues');
        const venues = res.data.venues;
        venues.map(item => {
          if (!item.spaces) {
            item.spaces = [];
          }
          return item;
        })

        dispatch({
          type: GET_VENUE_SUCCESS,
          payload: venues
        })

      } catch (err) {
        console.log("Get Venus Setting failed.")
        dispatch({ type: GET_VENUE_ERROR });
      }
    }

    getVenue();

  }, []);

  const addVenues = async (name) => {
    dispatch({ type: REQUEST_ADD_VENUE });

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/venues', JSON.stringify({ name }), config);

      dispatch({
        type: GET_ADD_VENUE_SUCCESS,
        payload: res.data.venue
      })
      setAddingVenue(false);

    } catch (err) {
      dispatch({ type: GET_ADD_VENUE_ERROR })
    }
  }

  const deleteVenue = async (id) => {
    setSelectedVenueIndex(null);
    dispatch({ type: REQUEST_DELETE_VENUE });
    try {
      await axios.delete(`/venues/${id}`);
      dispatch({
        type: GET_DELETE_VENUE_SUCCESS,
        payload: id
      });
    } catch (err) {
      dispatch({ type: GET_DELETE_VENUE_ERROR });
    }
  }

  const editVenue = async (id, name) => {
    dispatch({ type: REQUEST_EDIT_VENUE });
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      await axios.put(`/venues/${id}`, JSON.stringify({ id, name }), config);
      dispatch({
        type: GET_EDIT_VENUE_SUCCESS,
        payload: { id, name }
      });
    } catch (err) {
      dispatch({ type: GET_EDIT_VENUE_ERROR });
    }
  }

  const getSpacesOfVenue = async (venueId) => {
    dispatch({ type: REQUEST_GET_VENUE_SPACES });
    try {
      const res = await axios.get(`/spaces/venue/${venueId}`);
      dispatch({
        type: GET_VENUE_SPACES_SUCCESS,
        payload: res.data.spaces
      })
    } catch (err) {
      dispatch({ type: GET_VENUE_SPACES_ERROR })
    }
  }

  const addSpaceOfVenue = async (VenueId, name) => {
    dispatch({ type: REQUEST_ADD_VENUE_SPACE });

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const res = await axios.post('/spaces', JSON.stringify({ VenueId, name }), config);
      dispatch({
        type: GET_ADD_VENUE_SPACE_SUCCESS,
        payload: res.data.space
      });
      setAddingSpace(false);
    } catch (err) {
      dispatch({ type: GET_ADD_VENUE_SPACE_ERROR });
      setAddingSpace(false);
    }
  }

  const editSpaceOfVenue = async (id, name) => {
    dispatch({ type: REQUEST_EDIT_VENUE_SPACE });
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
       await axios.put(`/spaces/${id}`, JSON.stringify({ id, name }), config);
      dispatch({
        type: GET_EDIT_VENUE_SPACE_SUCCESS,
        payload: { id, name }
      });
    } catch (err) {
      dispatch({ type: GET_EDIT_VENUE_SPACE_ERROR });
    }
  }

  const deleteSpaceOfVenue = async (id) => {
    dispatch({ type: REQUEST_DELETE_VENUE_SPACE });
    try {
      await axios.delete(`/spaces/${id}`);
      dispatch({
        type: GET_DELETE_VENUE_SPACE_SUCCESS,
        payload: id
      });
    } catch (err) {
      dispatch({ type: GET_DELETE_VENUE_SPACE_ERROR });
    }
  }

  return (
    <ColumnContainer>
      {/* VENUES */}
      <Column
        title="Venues"
        buttonTitle="Add Venue"
        message={
          state.venues.length === 0 &&
          !addingVenue &&
          "Add a venue to get started"
        }
        onButtonClick={() => {
          setSelectedVenueIndex(null);
          setAddingVenue(true);
        }}
        loading={state.venueActionLoading}
      >
        <SpinnerContainer loading={state.venueActionLoading.toString()} />
        {addingVenue && (
          <Cell
            newMode
            insertPlaceholder={"Venue Name"}
            onAddValue={name => { addVenues(name) }}
            onCancel={() => {
              setAddingVenue(false);
            }}
            loading={state.venueActionLoading}
          />
        )}
        {state.venues.map((venue) => (
          <Cell
            selected={selectedVenueIndex === venue.id}
            clickable
            loading={state.venueActionLoading}
            key={venue.id}
            title={venue.name}
            onEditValue={name => {
              editVenue(venue.id, name)
            }}
            onDelete={() => {
              deleteVenue(venue.id)
            }}
            onClick={() => {
              setSelectedVenueIndex(venue.id);
              getSpacesOfVenue(venue.id);
            }}
          />
        ))}
      </Column>

      {/* SPACES */}
      <Column
        title={selectedVenue ? selectedVenue.name : "Spaces"}
        buttonTitle={selectedVenueIndex !== null && "Add Space"}
        message={(() => {
          if (selectedVenueIndex === null) {
            return "Select a venue to view its spaces";
          } else if (state.selectedVenueSpaces.length === 0 && !addingSpace) {
            return `Add a Space to get started`;
          }
        })()}
        onButtonClick={() => setAddingSpace(true)}
        loading={state.spaceActionLoading}
      >
        {state.spacesLoading ? (
          <SpinnerContainer loading={state.spacesLoading.toString()} />
        ) : (
            <React.Fragment>
              <SpinnerContainer loading={state.spaceActionLoading.toString()} />
              {addingSpace && (
                <Cell
                  newMode
                  insertPlaceholder={"Space Name"}
                  onAddValue={name => {
                    addSpaceOfVenue(selectedVenueIndex, name);
                  }}
                  onCancel={() => {
                    setAddingSpace(false);
                  }}
                  loading={state.spaceActionLoading}
                />
              )}

              {state.selectedVenueSpaces.map((space, index) => (
                <Cell
                  key={space.id}
                  title={space.name}
                  accentColor={space.accentColor}
                  onEditValue={name => {
                    editSpaceOfVenue(space.id, name)
                  }}
                  onDelete={() => {
                    deleteSpaceOfVenue(space.id)
                  }}
                  loading={state.spaceActionLoading}
                />
              ))}
            </React.Fragment>
          )
        }
      </Column>
    </ColumnContainer>
  );
};

const ColumnContainer = ({ children = null }) => {

  const { state } = useContext(AppReducerContext);
  return (
    <div
      className={css`
        display: flex;
        position: relative;
        /* background-color: green; */
      `}
    >
      <SpinnerContainer loading={state.settings.loading.toString()} />
      {!state.settings.loading && children}
    </div>
  )
};

const Column = ({
  title = "",
  buttonTitle = "",
  message = null,
  onButtonClick,
  children = null,
  loading = false,
}) => (
    <div
      className={css`
      width: 40%;
      min-width: 350px;
      margin-right: 2em;
      position: relative;      
    `}
    >
      <div
        className={css`
        display: flex;
        justify-content: space-between;
        margin-top: 0.8 em;
        margin-bottom: 1em;
      `}
      >
        {title && <H3>{title}</H3>}
        {buttonTitle && (
          <Button primary onClick={onButtonClick} disabled={loading}>
            {buttonTitle}
          </Button>
        )}
      </div>
      {message && <P1>{message}</P1>}
      {children}
    </div>
  )

const Cell = ({
  title = "",
  newMode = false,
  insertPlaceholder: placeholder = "",
  onAddValue = null,
  onEditValue = null,
  onDelete = null,
  onCancel = null,
  onClick = null,
  selected = false,
  clickable = false,
  accentColor = null,
  loading = false,
}) => {
  const [value, setValue] = useState(title);
  const [editing, setEditing] = useState(newMode);
  const [isValidate, setIsValidate] = useState(true);

  const handleChange = (value) => {
    setValue(value);
    if (value.length === 0)
      setIsValidate(false);
    else setIsValidate(true);
  }

  const handleSave = () => {
    if (value.length === 0) {
      setIsValidate(false);
    } else onAddValue(value);
  }

  const handleCancel = () => {
    onCancel();
  }

  const handleEditCancel = () => {
    setEditing(false);
    setValue(title);
  }
  return (
    <div
      className={css`
        width: 100%;
        background-color: ${selected ? colors.accent_pink + "10" : "white"};
        margin-right: 1em;
        padding: 5px 10px;
        border-bottom: 1px solid ${colors.lighter};
        p {
          margin: 0;
          height: 28px;
        }
        input {
          height: 28px;
        }
        pointer-events: ${loading ? "none" : "initial"};
        opacity: ${loading ? "0.7" : "1"};
        ${!newMode &&
        !editing &&
        css`
            button {
              display: none;
            }
          `}
        :hover button {
          display: inline-block;
        }
        button {
          background: none;
          color: inherit;
          border: none;
          cursor: pointer;
          font-size: 0.8em;
          /* text-decoration: underline; */
          outline: none;
        }
      `}
    >
      {(() => {
        if (editing) {
          return (
            <div
              className={css`
                display: flex;
                justify-content: space-between;
              `}
            >
              <div className={css`
                display: flex;                
                `}
              >
                <TableEditableValue
                  autoFocus
                  placeholder={placeholder}
                  value={value}
                  onChange={value => { handleChange(value) }}
                  className={isValidate ? "" : "error"}
                />
                {!isValidate &&
                  <p
                    className={css`
                      color: #E92579;
                      font-size: 0.8em;
                      line-height: 28px;
                      margin: 0 0 0 10px !important;
                    `}>
                    Requiried
                  </p>
                }
              </div>
              <div>
                <button
                  onClick={() => {
                    if (newMode) {
                      handleCancel();
                    } else {
                      handleEditCancel();
                    }
                  }}
                  style={{ color: "gray" }}
                >
                  cancel
                </button>
                <button
                  onClick={() => {
                    if (newMode) {
                      handleSave();
                    } else {
                      onEditValue(value);
                      setEditing(false);
                    }
                  }}
                  style={{ color: "green" }}
                >
                  save
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div
              className={css`
                display: flex;
                justify-content: space-between;
              `}
            >
              <P1
                color="dark"
                onClick={onClick}
                className={css`
                  width: 70%;
                  ${clickable &&
                  css`
                      :hover {
                        opacity: 0.7;
                      }
                      :active {
                        opacity: 0.9;
                      }
                      cursor: pointer;
                    `}
                `}
              >
                {accentColor && <ColoredDot color={accentColor} />} {title}
              </P1>
              <div>
                <button onClick={() => onDelete()} style={{ color: "red" }}>
                  remove
                </button>
                <button onClick={() => setEditing(true)}>edit</button>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
};

export default VenuesAndSpacesPage;
