import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./components/CustomerDetails";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";
import ChallanForm from "./components/ChallanForm";
import ChallanDetails from "./pages/ChallanDetails";


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
<Route
  path="/challans"
  element={
    <Layout>
      <Challans />
    </Layout>
  }
/>
<Route
  path="/challans/new"
  element={
    <Layout>
      <ChallanForm />
    </Layout>
  }
/>
            <Route
              path="/customers"
              element={
                <Layout>
                  <Customers />
                </Layout>
              }
            />
            <Route
  path="/inventory"
  element={
    <Layout>
      <Inventory />
    </Layout>
  }
/>
<Route
  path="/challans/:id"
  element={
    <Layout>
      <ChallanDetails />
    </Layout>
  }
/>
            <Route
              path="/customers/:id"
              element={
                <Layout>
                  <CustomerDetails />
                </Layout>
              }
            />
            

            <Route
              path="/products"
              element={
                <Layout>
                  <Products />
                </Layout>
              }
            />
          </Route>
          <Route
  path="/products/:id"
  element={
    <Layout>
      <ProductDetails />
    </Layout>
  }
/>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;