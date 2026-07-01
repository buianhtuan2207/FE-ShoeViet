import React from 'react';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import {FavoriteProvider} from "./context/FavoriteContext";

function App() {
  return (
      <FavoriteProvider>
          <BrowserRouter>
            {/*<AuthProvider>*/}
              <AppRoutes />
            {/*</AuthProvider>*/}
          </BrowserRouter>
      </FavoriteProvider>
  );
}

export default App;