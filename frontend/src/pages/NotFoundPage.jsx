import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found page-enter">
      <span>404</span>
      <h1>Page not found</h1>
      <p>The requested workspace page does not exist.</p>
      <Link className="primary-button" to="/">Return to overview</Link>
    </div>
  );
}
