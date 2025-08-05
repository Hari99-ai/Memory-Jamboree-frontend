import React, { forwardRef } from 'react';

interface CertificateProps {
  championship: string;
  name: string;
  rank: string;
  score: string;
  date: string;
}

const Certificate = forwardRef((props: CertificateProps, ref: React.Ref<HTMLDivElement>) => {
  const { championship, name, rank, score, date } = props;

  return (
    <div
      ref={ref}
      className="relative w-[800px] h-[560px] bg-white overflow-hidden border-2 border-gray-300 rounded-md shadow-lg font-sans"
    >
      {/* Decorative Gradient Corners */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-800 to-blue-300 rounded-br-[80%]" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-yellow-400 to-yellow-200 rounded-bl-[80%]" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-200 to-yellow-400 rounded-tr-[80%]" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-blue-300 to-blue-800 rounded-tl-[80%]" />

      {/* Title */}
      <div className="mt-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-wide text-blue-900">CERTIFICATE</h1>
        <p className="mt-1 text-sm font-medium tracking-wider text-blue-600 uppercase">of Achievement</p>
      </div>

      {/* Recipient Name */}
      <h2 className="mt-8 text-center text-3xl font-[cursive] text-black">{name}</h2>

      {/* Description */}
      <p className="px-10 mt-6 text-sm leading-relaxed text-center text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In recognition of your outstanding performance,
        you are awarded this certificate for securing <strong>Rank: {rank}</strong> in the prestigious{' '}
        <strong>{championship}</strong> with a score of <strong>{score}</strong>.
      </p>

      {/* Footer: Date & Signature */}
      <div className="absolute left-0 right-0 flex justify-between px-16 text-sm text-center text-gray-700 bottom-16">
        {/* Date */}
        <div>
          <p className="mb-1">{date}</p>
          <div className="w-32 mx-auto border-t border-gray-400" />
          <span className="text-xs uppercase">Date</span>
        </div>

        {/* Signature */}
        <div>
          <div className="w-32 mx-auto mb-1 border-t border-gray-400" />
          <span className="text-xs uppercase">Signature</span>
        </div>
      </div>

      {/* Gold Medal Circle (CSS-only) */}
      <div className="absolute transform -translate-x-1/2 bottom-6 left-1/2">
        <div className="flex items-center justify-center w-16 h-16 border-2 border-yellow-500 rounded-full shadow-md bg-gradient-to-br from-yellow-300 to-yellow-100">
          <div className="w-6 h-6 bg-yellow-500 rounded-full" />
        </div>
        <p className="mt-1 text-xs text-center text-gray-600 uppercase">Certificate of Achievement</p>
      </div>
    </div>
  );
});

export default Certificate;
