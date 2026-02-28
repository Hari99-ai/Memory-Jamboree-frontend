import Hero from "./homeComponents/Hero";
import MainHeader from "./homeComponents/MainHeader";
import HowItWorks from "./homeComponents/HowItWorks";
import Features from "./homeComponents/Features";
import Footer from "./homeComponents/Footer";
import Contact from "./homeComponents/Contact";

const Home = () => {
  return (
    <>
      <div className="w-screen min-h-screen flex flex-col overflow-x-hidden">
        {/* Header */}
        <MainHeader />

        {/* Main Content */}
        <Hero />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Features Section */}
        <Features />
        {/**contact */}
        <Contact/>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Home;