// import './App.css'

// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
// import ProtectDashboard from './middleware/ProtectDashboard'
// import MainLayout from './dashboard/layout/MainLayout'
// import Login from './dashboard/pages/Login'
// import AdminIndex from './dashboard/pages/AdminIndex'
// import Menu from './dashboard/pages/Menu'
// // import Drivers from './dashboard/pages/Drivers'
// import Customer from './dashboard/pages/Customers'
// import Registration from './dashboard/pages/Registration'
// import AddKitchen from './dashboard/pages/AddKitchen'
// import Setting from './dashboard/pages/Setting'
// import Payment from './dashboard/pages/Payment'
// import Analytics from './dashboard/pages/Analytics'
// // import PlanDetails from './dashboard/pages/PlanDetails'

// import Subscription from './dashboard/pages/Subscription'
// import Event from './dashboard/pages/Event'
// import Instant from './dashboard/pages/Instant'
// import Promotions from './dashboard/pages/Promotions'




// function App() {

//   return (
    
//     <BrowserRouter>
//       <Routes>
//         <Route path='/'>
//           <Route index element={<Login />} />
//           <Route path='register' element={<Registration />}/>
//         </Route>
//         <Route path='/dashboard' element={<ProtectDashboard />}>
//           <Route path='' element={<MainLayout />}>
//             <Route path='' element={<Navigate to='/dashboard/admin' />} />
//             <Route path='admin' element={<AdminIndex />} />
//             <Route path='menu' element={<Menu />} />
//             <Route path='Instant' element={<Instant />} />
//             {/* <Route path='Planner' element={<Planner />} /> */}
//             <Route path='Subscription' element={<Subscription />} />
//             <Route path='Event' element={<Event/>} />
//             {/* <Route path='plan' element={<PlanDetails />} />    */}
//             {/* <Route path='drivers' element={<Drivers />} />      */}
  
//             <Route path='customer' element={<Customer />} />
//             <Route path='setting' element={<Setting />} />
//             <Route path='analytic' element={<Analytics />} />
//             <Route path='payment' element={<Payment />} />
//             <Route path='Promotions' element={<Promotions />} />
//             <Route path='add-kitchen' element={<AddKitchen />} />
//           </Route>
//         </Route>
//       </Routes>
//     </BrowserRouter>

    
   
//   )
// }

// export default App
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectDashboard from './middleware/ProtectDashboard'
import MainLayout from './dashboard/layout/MainLayout'
import Login from './dashboard/pages/Login'
import AdminIndex from './dashboard/pages/AdminIndex'
import Menu from './dashboard/pages/Menu'
import Customer from './dashboard/pages/Customers'
import Registration from './dashboard/pages/Registration'
import AddKitchen from './dashboard/pages/AddKitchen'
import Setting from './dashboard/pages/Setting'
import Payment from './dashboard/pages/Payment'
import Analytics from './dashboard/pages/Analytics'
import Subscription from './dashboard/pages/Subscription'
import Event from './dashboard/pages/Event'
import Instant from './dashboard/pages/Instant'
import Promotions from './dashboard/pages/Promotions'
import { OrderWebSocketProvider } from './context/OrderWebSocketProvider'
import { useToken } from './context/StoreProvider'

// Wrapper component to access token from StoreProvider
function AppContent() {
  const { token } = useToken();

  return (
    <OrderWebSocketProvider token={token}>
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<Login />} />
            <Route path='register' element={<Registration />} />
          </Route>
          <Route path='/dashboard' element={<ProtectDashboard />}>
            <Route path='' element={<MainLayout />}>
              <Route path='' element={<Navigate to='/dashboard/admin' />} />
              <Route path='admin' element={<AdminIndex />} />
              <Route path='menu' element={<Menu />} />
              <Route path='Instant' element={<Instant />} />
              <Route path='Subscription' element={<Subscription />} />
              <Route path='Event' element={<Event />} />
              <Route path='customer' element={<Customer />} />
              <Route path='setting' element={<Setting />} />
              <Route path='analytic' element={<Analytics />} />
              <Route path='payment' element={<Payment />} />
              <Route path='Promotions' element={<Promotions />} />
              <Route path='add-kitchen' element={<AddKitchen />} />
            </Route>
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </OrderWebSocketProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App