const FeatureSection = () => {
  return (
    <section className="w-[100vw] flex flex-col items-center bg-white px-6 md:px-16 py-16">
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Heading */}
        <h1
          className="text-primary-1 font-heading text-4xl text-center md:text-5xl font-bold mb-10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Memory Disciplines
        </h1>
 
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="md:w-1/2">
            {/* <h1
              className="text-4xl md:text-5xl font-bold text-text-1 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Track and <span className="italic">Analyze</span> <br />
              <span className="italic">Exams</span> in Real Time
            </h1> */}
            {/* <p
              className="mt-6 text-base text-text-2"
              style={{ fontFamily: "var(--font-main)" }}
            >
              Centralize and simplify exam monitoring, and get comprehensive insights on exam integrity with our advanced AI-enabled proctoring system.
            </p> */}
 
            <div className="mt-8 space-y-4 text-sm" style={{ fontFamily: "var(--font-main)" }}>
              <div className="flex items-center gap-3 bg-yellow-100 text-[#FF8B00] py-2 px-4 rounded-full w-fit">
                1. Memorising Images.
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 text-[#5c2ded] py-2 px-4 rounded-full w-fit">
                2. Memorising Words
              </div>
              <div className="flex items-center gap-3  bg-yellow-100 text-[#FF8B00]   py-2 px-4 rounded-full w-fit">
                {/* ✅No training or maintenance needed. */}3. Memorising Numbers
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 text-[#5c2ded] py-2 px-4 rounded-full w-fit">
                4. Memorising Dates
              </div>
              <div className="flex items-center gap-3 bg-yellow-100 text-[#FF8B00] py-2 px-4 rounded-full w-fit">
                5. Memorising binary digits
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 text-[#5c2ded] py-2 px-4 rounded-full w-fit">
                6. Memorising Deck of Cards
              </div>
              <div className="flex items-center gap-3 bg-yellow-100 text-[#FF8B00] py-2 px-4 rounded-full w-fit">
                7. Memorising spoken numbers
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 text-[#5c2ded] py-2 px-4 rounded-full w-fit">
                8. Memorising names & faces
              </div>
            </div>
          </div>
 
          {/* Right Image */}
          <div className="md:w-1/2 relative mt-10">
            <img
              src="/Landing/memoryChampion.png"
              alt="Feature Dashboard Preview"
              className="w-full h-auto max-w-[600px] mx-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default FeatureSection;