import { Link } from "react-router-dom";


const CancelPage = () => {
  return (
    <div>
      <h1>Payment Canceled</h1>
      <p>Sorry, the payment process was canceled. Please try again later.</p>
      <Link to={'/payment'}>Retry Again</Link>
    </div>
  );
};

export default CancelPage;
