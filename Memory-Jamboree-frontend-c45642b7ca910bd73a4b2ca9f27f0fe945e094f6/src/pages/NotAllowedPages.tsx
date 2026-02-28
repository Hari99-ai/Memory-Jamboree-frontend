import { FaDesktop } from "react-icons/fa";
import { useRouter } from "../hooks/useRouter";

export default function NotAllowedPage() {

  const router = useRouter()
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <FaDesktop className="text-6xl text-blue-500 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-gray-700 mb-6">
          You cannot open this page here. <br />
          Please use a <span className="font-bold">desktop</span> to access it.
        </p>
        <button
          onClick={() => router.back()} 
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
