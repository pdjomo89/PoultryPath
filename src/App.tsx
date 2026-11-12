import { useLayoutEffect } from 'react';
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import StartFarm from './pages/StartFarm';
import Calculator from './pages/Calculator';
import Training from './pages/Training';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Credits from './pages/Credits';
import News, { NewsArticle } from './pages/News';

/**
 * Every click to a new page starts at the top, instantly — before the new page
 * paints — so you never land mid-page or at the footer of the new page.
 * Back/forward (POP) is left to the browser.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useLayoutEffect(() => {
    if (navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, navigationType]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/start-a-farm" element={<StartFarm />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/training" element={<Training />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
