
// import { createContext, useContext, useState } from 'react';

// const storeContext = createContext();

// export const StoreProvider = ({ children }) => {
//     const [token, setToken] = useState(localStorage.getItem('kitchenToken') || null);
//     const [registerToken, setRegisterToken] = useState(localStorage.getItem('RegisterToken') || null);

//     return (
//         <storeContext.Provider value={{ token, setToken, registerToken, setRegisterToken }}>
//             {children}
//         </storeContext.Provider>
//     );
// };

// export const useToken = () => {
//     return useContext(storeContext);
// };

import { createContext, useContext, useState } from 'react';

const storeContext = createContext();

export const StoreProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('kitchenToken') || null);
  const [registerToken, setRegisterToken] = useState(localStorage.getItem('RegisterToken') || null);
  const [kitchenId, setKitchenId] = useState(localStorage.getItem('kitchenId') || null);

  return (
    <storeContext.Provider value={{
      token, setToken,
      registerToken, setRegisterToken,
      kitchenId, setKitchenId
    }}>
      {children}
    </storeContext.Provider>
  );
};

export const useToken = () => {
  return useContext(storeContext);
};
