import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";

import Hero from "./components/Hero/Hero";
import Collections from "./components/Collections/Collections";
import About from "./components/About/About";
import BrandValues from "./components/BrandValues/BrandValues";
import Craftsmanship from "./components/Craftsmanship/Craftsmanship";
import LuxuryBanner from "./components/LuxuryBanner/LuxuryBanner";
import OurStory from "./components/OurStory/OurStory";
import CTA from "./components/CTA/CTA";
import Testimonials from "./components/Testimonials/Testimonials";
import Instagram from "./components/Instagram/Instagram";
import Contact from "./components/Contact/Contact";

import ProductListing from "./pages/ProductListing/ProductListing";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import AboutUS from "./pages/AboutUS/AboutUS";
import ContactUs from "./pages/ContactUs/ContactUs";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";


function Home() {
  return (
    <main>
      <Hero />
      <Collections />
      <About />
      <BrandValues />
      <Craftsmanship />
      <LuxuryBanner />
      <OurStory />
      <CTA />
      <Testimonials />
      <Instagram />
      <Contact />
    </main>
  );
}


function GlobalLayout() {
  return (
    <>
      <Header />

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* PRODUCT LISTING */}
        <Route
          path="/products/:category"
          element={<ProductListing />}
        />

        {/* PRODUCT DETAILS */}
        <Route
          path="/products/:category/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/about"
          element={<AboutUS />}
        />

        <Route path="/contact" element={<ContactUs />} />
        
      </Routes>

      <Footer />

      <FloatingButtons />
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalLayout />
    </BrowserRouter>
  );
}


export default App;
