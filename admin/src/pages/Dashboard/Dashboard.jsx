import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-home">

      <div className="dashboard-welcome">

        <span className="dashboard-welcome-label">
          WELCOME BACK
        </span>

        <h2>
          Padmavati Jewellers
        </h2>

        <p>
          Manage your website content,
          products and customer enquiries
          from one place.
        </p>

      </div>

      <div className="dashboard-placeholder-grid">

        <div className="dashboard-placeholder-card">
          <span>01</span>
          <h3>Hero Video</h3>
          <p>
            Manage the website hero video.
          </p>
        </div>

        <div className="dashboard-placeholder-card">
          <span>02</span>
          <h3>Products</h3>
          <p>
            Manage Gold, Diamond and Polki
            jewellery.
          </p>
        </div>

        <div className="dashboard-placeholder-card">
          <span>03</span>
          <h3>Testimonials</h3>
          <p>
            Manage customer testimonials
            and ratings.
          </p>
        </div>

        <div className="dashboard-placeholder-card">
          <span>04</span>
          <h3>Instagram</h3>
          <p>
            Manage Instagram media and links.
          </p>
        </div>

        <div className="dashboard-placeholder-card">
          <span>05</span>
          <h3>Contact</h3>
          <p>
            View and manage contact enquiries.
          </p>
        </div>

        <div className="dashboard-placeholder-card">
          <span>06</span>
          <h3>Administration</h3>
          <p>
            Manage admins and account security.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;