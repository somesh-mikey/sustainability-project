import db from "../db.js";
import dotenv from "dotenv";
import { hashPassword } from "../auth/password.js";

dotenv.config();

async function seedClientData() {
  console.log("🌱 Seeding client portal demo data...\n");

  try {
    // 1. Create a client organization
    const orgResult = await db.query(
      `INSERT INTO organizations (name, industry, registration_number, country, address)
       VALUES ('EcoTech Solutions', 'Technology', 'REG-2025-001', 'United States', '123 Green Street, San Francisco, CA')
       ON CONFLICT DO NOTHING
       RETURNING id`
    );

    let clientOrgId;
    if (orgResult.rows.length > 0) {
      clientOrgId = orgResult.rows[0].id;
      console.log(`✅ Created client organization: EcoTech Solutions (id: ${clientOrgId})`);
    } else {
      // Check if it exists
      const existing = await db.query(`SELECT id FROM organizations WHERE name = 'EcoTech Solutions'`);
      clientOrgId = existing.rows[0]?.id;
      console.log(`ℹ️  Client organization already exists (id: ${clientOrgId})`);
    }

    // 2. Create a client user
    const passwordHash = await hashPassword("client123");
    const userResult = await db.query(
      `INSERT INTO users (organization_id, name, email, password_hash, role, is_active)
       VALUES ($1, 'Sarah Johnson', 'client@ecotech.com', $2, 'client', true)
       ON CONFLICT (email) DO UPDATE SET role = 'client'
       RETURNING id`,
      [clientOrgId, passwordHash]
    );
    const clientUserId = userResult.rows[0].id;
    console.log(`✅ Created client user: client@ecotech.com (id: ${clientUserId})`);

    // Get the Wefetch org (company side)
    const wefetchOrg = await db.query(`SELECT id FROM organizations WHERE name = 'Wefetch' LIMIT 1`);
    const wefetchOrgId = wefetchOrg.rows[0]?.id || 1;

    // 3. Create data requests
    const dataRequests = [
      { category: "Electricity Consumption", period: "Q1 2025", deadline: "2025-04-15", priority: "high", status: "pending", description: "Please upload your electricity consumption data for Q1 2025, including all office locations." },
      { category: "Water Usage", period: "Q1 2025", deadline: "2025-04-20", priority: "medium", status: "pending", description: "Submit water usage records for all facilities including consumption metrics." },
      { category: "Fleet Fuel Data", period: "March 2025", deadline: "2025-04-10", priority: "high", status: "pending", description: "Upload fleet fuel consumption data including diesel and petrol usage." },
      { category: "Waste Management", period: "Q1 2025", deadline: "2025-04-25", priority: "low", status: "submitted", description: "Waste disposal records for Q1 including recycling and landfill data." },
      { category: "Business Travel", period: "Q1 2025", deadline: "2025-03-30", priority: "medium", status: "under_review", description: "Business travel data including flights, hotel stays, and ground transport." },
      { category: "Supply Chain", period: "Annual 2024", deadline: "2025-05-01", priority: "high", status: "pending", description: "Annual supply chain sustainability assessment data." },
      { category: "Employee Commute", period: "Q1 2025", deadline: "2025-04-30", priority: "low", status: "closed", description: "Employee commute survey results and transport mode data." },
      { category: "Refrigerant Data", period: "Annual 2024", deadline: "2025-03-15", priority: "medium", status: "closed", description: "Refrigerant leakage and top-up data for all HVAC systems." },
    ];

    for (const dr of dataRequests) {
      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.query(
        `INSERT INTO data_requests (organization_id, request_id, category, reason, period, deadline, status, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [clientOrgId, requestId, dr.category, dr.description, dr.period, dr.deadline, dr.status, dr.priority]
      );
      await new Promise(r => setTimeout(r, 50)); // ensure unique timestamps
    }
    console.log(`✅ Created ${dataRequests.length} data requests`);

    // Get admin user for "company-side" messages
    const adminUser = await db.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    const adminUserId = adminUser.rows[0]?.id || 1;

    // 4. Create messages
    const messages = [
      { senderId: clientUserId, content: "Hi, I have a question about the Q1 electricity data format. What columns are required?", orgId: clientOrgId },
      { senderId: adminUserId, content: "Hello Sarah! The electricity data should include: Date, Location, kWh consumed, and Meter ID. You can use our template from the Data Requests section.", orgId: clientOrgId },
      { senderId: clientUserId, content: "Thanks! I've prepared the data. Should I consolidate all locations into one file?", orgId: clientOrgId },
      { senderId: adminUserId, content: "Yes, please consolidate all locations into a single CSV file. Make sure each row includes the location name so we can break it down.", orgId: clientOrgId },
      { senderId: clientUserId, content: "Got it, I'll upload it by end of day. Also, when can we expect the Q4 2024 report?", orgId: clientOrgId },
      { senderId: adminUserId, content: "The Q4 2024 report is currently being finalized. You should receive it within the next 2-3 business days. We'll notify you when it's ready.", orgId: clientOrgId },
    ];

    for (const msg of messages) {
      await db.query(
        `INSERT INTO messages (sender_id, organization_id, content) VALUES ($1, $2, $3)`,
        [msg.senderId, msg.orgId, msg.content]
      );
      // Small delay to ensure different timestamps
      await new Promise(r => setTimeout(r, 100));
    }
    console.log(`✅ Created ${messages.length} messages`);

    // 5. Create notifications
    const notifications = [
      { type: "data_request", title: "New Data Request", description: "Electricity Consumption data requested for Q1 2025", userId: clientUserId, orgId: clientOrgId },
      { type: "data_request", title: "New Data Request", description: "Water Usage data requested for Q1 2025", userId: clientUserId, orgId: clientOrgId },
      { type: "message", title: "New Message from Wefetch", description: "Your question about electricity data format has been answered", userId: clientUserId, orgId: clientOrgId },
      { type: "data_request", title: "Deadline Approaching", description: "Fleet Fuel Data is due in 5 days", userId: clientUserId, orgId: clientOrgId },
      { type: "report", title: "Report Ready", description: "Your Q3 2024 Sustainability Summary is now available", userId: clientUserId, orgId: clientOrgId, isRead: true },
      { type: "data_request", title: "Data Accepted", description: "Employee Commute data has been reviewed and accepted", userId: clientUserId, orgId: clientOrgId, isRead: true },
      { type: "system", title: "Welcome to Wefetch", description: "Your account has been set up. Start by reviewing your data requests.", userId: clientUserId, orgId: clientOrgId, isRead: true },
      { type: "message", title: "New Message from Wefetch", description: "Update about your Q4 2024 report", userId: clientUserId, orgId: clientOrgId },
    ];

    for (const notif of notifications) {
      await db.query(
        `INSERT INTO notifications (organization_id, user_id, type, title, description, is_read)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [notif.orgId, notif.userId, notif.type, notif.title, notif.description, notif.isRead || false]
      );
    }
    console.log(`✅ Created ${notifications.length} notifications`);

    // 6. Create sample report requests
    const reports = [
      { type: "sustainability_summary", description: "Q3 2024 full sustainability report", status: "completed" },
      { type: "carbon_footprint", description: "Annual carbon footprint analysis for 2024", status: "pending" },
    ];

    for (const r of reports) {
      await db.query(
        `INSERT INTO reports (organization_id, type, report_type, description, status, filters, file_path, generated_by)
         VALUES ($1, $2, $3, $4, $5, '{}', '', $6)`,
        [clientOrgId, r.type, r.type, r.description, r.status, clientUserId]
      );
    }
    console.log(`✅ Created ${reports.length} report requests`);

    console.log("\n🎉 Client portal seed data complete!");
    console.log("\n📋 Login credentials:");
    console.log("   Client:  client@ecotech.com / client123");
    console.log("   Admin:   admin@company.com / admin123");

  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    process.exit(0);
  }
}

seedClientData();
