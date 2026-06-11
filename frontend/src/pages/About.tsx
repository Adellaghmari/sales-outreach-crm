import './About.css';

export function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About this project</h1>
        <p>A portfolio CRM built to show fullstack skill, sales logic and product thinking</p>
      </div>

      <div className="about-content">
        <section className="card about-section">
          <div className="card-header">Why I built this</div>
          <div className="card-body">
            <p>I wanted a third portfolio project with its own identity. Not a support desk. Not a developer analytics tool. A sales operations workspace that shows how I think about pipeline, outreach, follow ups and revenue reporting.</p>
            <p>Outreach is simulated. No real emails are sent. The app includes a demo dataset for local review and is structured for PostgreSQL persistence in production, so recruiters can explore realistic sales workflows without external integrations.</p>
          </div>
        </section>

        <section className="card about-section">
          <div className="card-header">What this demonstrates</div>
          <div className="card-body">
            <div className="demo-grid">
              <div><strong>Fullstack</strong>React, TypeScript, Express, PostgreSQL, REST API</div>
              <div><strong>Data modeling</strong>Leads, deals, accounts, outreach, follow ups, activities</div>
              <div><strong>Business logic</strong>Lead scoring, pipeline forecast, recommended actions</div>
              <div><strong>Communication</strong>Outreach composer, templates, timeline, reply tracking</div>
              <div><strong>Product UX</strong>Command center dashboard, pipeline board, account view</div>
              <div><strong>Deployment ready</strong>Vercel, Render, Neon configuration</div>
            </div>
          </div>
        </section>

        <section className="card about-section">
          <div className="card-header">Recruiter walkthrough</div>
          <div className="card-body">
            <ol className="walkthrough-list">
              <li>Open the Revenue Command Center dashboard for pipeline health and today's priorities</li>
              <li>Browse Leads and open Amina El Karimi at Northstar Revenue for a full CRM case</li>
              <li>Check Accounts to see company level pipeline and primary contacts</li>
              <li>Move a deal on the Pipeline Board and review won/lost outcomes</li>
              <li>Create a new lead with the New Lead button in the top navigation</li>
              <li>Draft outreach, apply a template and mark a message as sent</li>
              <li>Complete or reschedule a follow up in the Follow Up Planner</li>
              <li>Review Reports for interpreted insights, not just charts</li>
            </ol>
          </div>
        </section>

        <section className="card about-section">
          <div className="card-header">Technical highlights</div>
          <div className="card-body">
            <ul className="walkthrough-list bullets">
              <li>REST API with dashboard aggregation, filtering and sorting</li>
              <li>Lead scoring based on title, status, source, activity and deal context</li>
              <li>Expected revenue = deal value × probability</li>
              <li>Dynamic follow up status with overdue detection</li>
              <li>Simulated outreach workflow with draft, sent and replied states</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
