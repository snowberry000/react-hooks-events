import React, { useReducer, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import axios from "axios";

import RoutesTree from "./routing/RoutesTree";
import Sidebar from "./components/layout/Sidebar";
import LayoutWrapper from "./components/layout/LayoutWrapper";
import LayoutSection from "./components/layout/LayoutSection";
import { AppReducerContext, reducer, initialState } from "./contexts/AppReducerContext";
import setAuthToken from "./utils/setAuthToken";
import CalendarPage from "./pages/CalendarPage";
import CONFIG from "./config";
import { GET_USER_SUCCESS, AUTH_ERROR } from "./reducers/actionType";

axios.defaults.baseURL = CONFIG.API_URL;

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = props => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {

    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    const getUser = async () => {      
      try {
        const res = await axios.get("/auth/me");
        dispatch({
          type: GET_USER_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: AUTH_ERROR
        });
      }
    }
    
    if (localStorage.token)
      getUser();
  }, [])

  return (
    <>
      <AppReducerContext.Provider value={{ state, dispatch }}>
        <Router>
          <Sidebar />
          <LayoutWrapper>
            <LayoutSection bgColor="lightest" fullWidth>
              <Switch>
                <Route path="/" exact component={CalendarPage} />      
                <Route component={RoutesTree} />
              </Switch>
            </LayoutSection>
          </LayoutWrapper>
        </Router>
      </AppReducerContext.Provider>
    </>
  );
};

export default App;
