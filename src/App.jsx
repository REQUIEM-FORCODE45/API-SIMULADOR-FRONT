import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import { MyRoutes } from "./routers/routes";
import styled from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { Light, Dark } from "./styles/Themes";
import { ThemeProvider } from "styled-components";
import { Provider } from 'react-redux';
import { LoginRoutes } from "./routers/LoginRoutes";
import { ThemeContext } from "./context/ThemeContext";
import { store } from './store';
import { SidebarProvider } from "./context/SidebarContext";


function App() {
  const [theme, setTheme] = useState("light");
  const themeStyle = theme === "light" ? Light : Dark;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <>
      <SidebarProvider>
        <Provider store={ store }>
          <ThemeContext.Provider value={{ setTheme, theme, sidebarOpen, setSidebarOpen  }}>
            <ThemeProvider theme={themeStyle}>
              <BrowserRouter>
                <Container className={sidebarOpen ? "sidebarState active" : ""}>
                  <LoginRoutes />
                </Container>
              </BrowserRouter>
            </ThemeProvider>
          </ThemeContext.Provider>
        </Provider>
      </SidebarProvider>
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-columns: 90px auto;
  background: ${({ theme }) => theme.bgtotal};
  transition:all 0.3s ;
  &.active {
    grid-template-columns: 300px auto;
  }
  color:${({theme})=>theme.text};
`;
export default App;
