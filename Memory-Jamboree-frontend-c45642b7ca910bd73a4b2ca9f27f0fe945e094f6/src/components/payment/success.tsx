import { Link } from "react-router-dom";


const SuccessPage = () => {
  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your purchase. Your payment was successful!</p>
      <Link to={'/dashboard'}>Back to dashboard</Link>
    </div>
  );
};

export default SuccessPage;
