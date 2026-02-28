import { Facebook,  Instagram, Linkedin, Youtube } from "lucide-react";
// import { FaGoogle } from "react-icons/fa";
 
const Footer = () => {
  return (
    <footer
      className="w-full py-8"
      style={{ backgroundColor: "var(--primary-1)", color: "var(--base)" }}
    >
      <div
        className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center"
        style={{ fontFamily: "var(--font-main)" }}
      >
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ProctorAI
          </div>
        </div>
 
        {/* Social Icons */}
 
 
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a
            href="https://www.facebook.com/WhiteForestAcademy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--base)" }}
            className="hover:text-secondary-base transition-colors duration-300"
          >
            <Facebook size={24} />
          </a>
          <a
            href="https://www.youtube.com/@WhiteForestAcademy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--base)" }}
            className="hover:text-secondary-base transition-colors duration-300"
          >
            <Youtube size={24} />
          </a>
          <a
            href="https://www.instagram.com/whiteforestacademy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--base)" }}
            className="hover:text-secondary-base transition-colors duration-300"
          >
            <Instagram size={24} />
          </a>
          <a
            href=" https://www.linkedin.com/in/coachmonicathomas/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--base)" }}
            className="hover:text-secondary-base transition-colors duration-300"
          >
            <Linkedin size={24} />
          </a>
 
        </div>
      </div>
 
      {/* Bottom Text */}
      <div
        className="text-center text-sm mt-6"
        style={{ fontFamily: "var(--font-main)" }}
      >
        © {new Date().getFullYear()} ProctorAI. All rights reserved.
      </div>
    </footer>
  );
};
 
export default Footer;
 