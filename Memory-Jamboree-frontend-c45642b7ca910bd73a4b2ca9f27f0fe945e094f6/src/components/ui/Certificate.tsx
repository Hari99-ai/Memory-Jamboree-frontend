import React, { forwardRef } from 'react';

interface CertificateProps {
  championship: string; // Corresponds to [Event name]
  name: string; // Corresponds to [Participant’s Full Name]
  rank: string; // Corresponds to [Rank Achieved] for Overall Rank
  categoryRank: string; // Corresponds to Category Rank
  score: string; // Corresponds to [Score Secured]
  date: string; // Corresponds to [Date/Event Duration]
}

const Certificate = forwardRef((props: CertificateProps, ref: React.Ref<HTMLDivElement>) => {
  const { championship, name, rank, categoryRank, score, date } = props;

  return (
    <div
      ref={ref}
      className="w-[700px] h-[500px] p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 text-black font-sans shadow-xl border border-gray-300 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Background corner shapes */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-br from-blue-500 to-transparent rounded-br-full opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-blue-700 to-transparent rounded-tr-full opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/4 h-1/3 bg-gradient-to-bl from-blue-400 to-transparent rounded-bl-full opacity-25 pointer-events-none" />

      {/* Main Content */}
      <div className="text-center">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-wide font-serif">
          Certificate of Participation
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto my-3 rounded-sm" />

        {/* Certification Text */}
        <p className="text-gray-700 text-base leading-relaxed mt-6">
          This is to certify that <strong className="text-xl font-bold text-blue-900">{name}</strong> has successfully participated in the{' '}
          <strong>{championship}</strong> held on <strong>{date}</strong>, and has demonstrated commendable performance.
        </p>

        {/* Achievement Details */}
        <div className="mt-6 mx-auto w-fit text-left bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="text-md font-semibold text-blue-800 mb-2 text-center">Achievement Details:</h4>
          <ul className="list-none space-y-1 text-gray-800">
            <li>
              <strong>Overall Rank:</strong> {rank}
            </li>
            <li>
              <strong>Category Rank:</strong> {categoryRank}
            </li>
            <li>
              <strong>Overall Score:</strong> {score}
            </li>
          </ul>
        </div>

        {/* Appreciation Note */}
        <p className="text-sm text-gray-600 font-medium italic mt-6">
          We appreciate your enthusiasm, focus, and commitment towards enhancing memory skills.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end px-8 text-xs text-gray-700">
        <div className="text-center">
          <p className="font-bold">[Organization/Institution Name]</p>
          <p className="mt-1 text-gray-600">[Seal/Stamp if applicable]</p>
        </div>

        <div className="text-center">
          <div className="border-t border-gray-500 w-40 mb-1" />
          <p>Authorized Signatory</p>
          <p className="font-semibold">[Name & Designation]</p>
        </div>
      </div>
    </div>
  );
});

export default Certificate;