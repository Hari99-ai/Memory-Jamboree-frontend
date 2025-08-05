import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative w-[100vw] min-h-[40vh] flex flex-col pt-26 bg-secondary-base overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        {/* Wave Pattern */}
        <svg
          className="absolute top-0 left-0 w-full h-[40vh]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="url(#wave-gradient)"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,176C384,192,480,192,576,186.7C672,181,768,171,864,165.3C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e3f2fd" />
              <stop offset="100%" stopColor="#fce4ec" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dots Pattern */}
        <svg
          className="absolute top-20 left-10 w-40 h-40 opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <circle cx="10" cy="10" r="3" fill="#bbdefb" />
          <circle cx="30" cy="10" r="3" fill="#bbdefb" />
          <circle cx="50" cy="10" r="3" fill="#bbdefb" />
          <circle cx="70" cy="10" r="3" fill="#bbdefb" />
          <circle cx="90" cy="10" r="3" fill="#bbdefb" />
          <circle cx="10" cy="30" r="3" fill="#bbdefb" />
          <circle cx="30" cy="30" r="3" fill="#bbdefb" />
          <circle cx="50" cy="30" r="3" fill="#bbdefb" />
          <circle cx="70" cy="30" r="3" fill="#bbdefb" />
          <circle cx="90" cy="30" r="3" fill="#bbdefb" />
        </svg>

        {/* Circle Pattern */}
        <svg
          className="absolute bottom-20 right-20 w-60 h-60 opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#ffccbc" />
        </svg>
      </div>

      {/* Content Layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center mt-10 px-6 lg:px-16 py-24 gap-12">
        {/* Left Image */}
        <div className="w-full lg:w-1/2 flex justify-center mt-10 lg:mt-20">
          <div className="relative w-[95%] md:w-[105%] lg:w-[115%] h-[350px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-tr from-[#e3f2fd] via-white to-[#fce4ec] p-1">
            <iframe
              src="https://www.youtube.com/embed/Mh3fC4k9bew?autoplay=1&mute=1"
              title="AI Proctored Exam Banner"
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* Right Text */}
        <div className="w-full lg:w-1/2 text-center lg:text-center mt-5">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-1 mt-20 mb-6">
            MEMORY JAMBOREE
          </h1>
          <p className="text-lg md:text-lg text-text-1 font-main  mb-8 leading-relaxed">
            A unique Battle-Of-Brains where memory athletes will compete against
            each other with their Brain power. A groundbreaking mission that’s
            here to change the way we learn, remember and grow. Let the battle
            of brains begin, step forward, assess your skills and prove your
            mettle in the ultimate test of memory and intellect
          </p>
          <Link
            to="/first-register"
            className="px-7 py-3  text-white text-base rounded-full transition-colors duration-300 hover:border-2 hover:border-[#245cab] border-transparent"
            style={{
              fontFamily: "var(--font-main)",
              backgroundColor: "var(--primary-1)",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#fff";
              (e.currentTarget as HTMLElement).style.color = "var(--primary-1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "var(--primary-1)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
          >
            Get Started!
          </Link>
        </div>
      </div>
    </div>
  );
}
