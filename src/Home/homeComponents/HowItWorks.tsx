const steps = [
  {
    heading: "Register as Memory Athlete",
    title: "Create Your Personal Account",
    description:
      "You can register with us as a memory athlete. Our platform will give you a stage to assess your memory, compete with fellow memory athletes and win prizes.",
    image: "/Landing/memoryAthelte.jpg",
  },
  {
    heading: "Do Regular Practice",
    title: "Of different Memory Disciplines regularly",
    description:
      "We bring to you the internationally approved multiple memory disciplines under one roof. Practice them everyday and see your performance boost.",
    image: "/Landing/doPractise.jpg",
  },
  {
    heading: "Be a Memory Champion",
    title: "Live Behavior Monitoring",
    description:
      "Take part in the upcoming Memory Jamboree event in your category. Compete with the fellow memory athletes and prove your brain strength with your power of memorization..",
    image: "/Landing/memory.jpg",
  },
  {
    heading: "Transform Yourself",
    title: "Boost Your Brain Power",
    description:
      "With memory sports you will transform yourself. It will help you strengthen your brain, master your memory and be a Super Learner with boosted focus and concentration level.",
    image: "/Landing/tranform.jpg",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full px-6 md:px-12 py-1 max-w-6xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-semibold mb-16 text-center"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--primary-1)",
        }}
      >
        How It Works ?
      </h2>

      <div className="space-y-24">
        {steps.map((step, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center ${
                isEven ? "" : "md:flex-row-reverse"
              } gap-12`}
            >
              {/* Number and Text */}
              <div className="md:w-1/2 space-y-6">
                <div
                  className="text-4xl font-bold flex"
                  style={{
                    color: "var(--highlight)",
                    fontFamily: "var(--font-main)",
                  }}
                >
                  {index + 1}.
                  <h3
                    className="text-4xl font-semibold ml-4"
                    style={{
                      fontFamily: "var(--highlight)",
                      color: "var(--font-main)",
                    }}
                  >
                    {step.heading}
                  </h3>
                </div>
                <h3
                  className="text-2xl font-semibold ml-10"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--text-1)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed ml-10"
                  style={{
                    fontFamily: "var(--font-main)",
                    color: "var(--text-2)",
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Right/Left Image */}
              {/* Right/Left Image */}
              <div className="md:w-1/2 h-64 flex items-center justify-center overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
