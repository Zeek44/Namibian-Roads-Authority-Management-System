import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding demo data...\n");

  // Get asset type IDs
  const assetTypes = await sql`SELECT id, name FROM asset_types`;
  const typeMap = {};
  assetTypes.forEach((t) => (typeMap[t.name] = t.id));
  console.log("Asset types:", Object.keys(typeMap).join(", "));

  // Get user IDs
  const users = await sql`SELECT id, name, role FROM users`;
  const adminUser = users.find((u) => u.role === "admin");
  const inspectorUser = users.find((u) => u.role === "inspector");
  const contractorUser = users.find((u) => u.role === "contractor");
  console.log("Users:", users.map((u) => u.name).join(", "));

  // --- ASSETS ---
  const assetsData = [
    {
      asset_id: "RD-WH-001",
      name: "Independence Avenue",
      asset_type_id: typeMap["Road"],
      description: "Main arterial road through Windhoek CBD, 4 lanes, asphalt surface",
      address: "Independence Avenue, Windhoek Central",
      longitude: 17.0836,
      latitude: -22.5609,
      condition_rating: 4,
      construction_date: "2005-03-15",
      last_maintenance_date: "2024-08-10",
    },
    {
      asset_id: "RD-WH-002",
      name: "Sam Nujoma Drive",
      asset_type_id: typeMap["Road"],
      description: "Major highway connecting Windhoek to northern suburbs, 2 lanes each direction",
      address: "Sam Nujoma Drive, Windhoek North",
      longitude: 17.0654,
      latitude: -22.5201,
      condition_rating: 3,
      construction_date: "2010-06-20",
      last_maintenance_date: "2023-11-05",
    },
    {
      asset_id: "RD-WK-003",
      name: "B1 National Road - Windhoek Section",
      asset_type_id: typeMap["Road"],
      description: "National highway B1 passing through Windhoek, heavy freight traffic",
      address: "B1 Highway, Windhoek South",
      longitude: 17.0932,
      latitude: -22.6120,
      condition_rating: 2,
      construction_date: "1998-01-10",
      last_maintenance_date: "2022-04-15",
    },
    {
      asset_id: "RD-SW-004",
      name: "Swakopmund Coastal Road",
      asset_type_id: typeMap["Road"],
      description: "Scenic coastal road connecting Swakopmund to Walvis Bay",
      address: "Coastal Road, Swakopmund",
      longitude: 14.5053,
      latitude: -22.6792,
      condition_rating: 4,
      construction_date: "2012-09-01",
      last_maintenance_date: "2025-01-20",
    },
    {
      asset_id: "BR-WH-001",
      name: "Robert Mugabe Bridge",
      asset_type_id: typeMap["Bridge"],
      description: "Steel-concrete composite bridge over drainage channel, 45m span",
      address: "Robert Mugabe Ave, Windhoek",
      longitude: 17.0819,
      latitude: -22.5705,
      condition_rating: 3,
      construction_date: "2001-11-20",
      last_maintenance_date: "2024-02-28",
    },
    {
      asset_id: "BR-RU-002",
      name: "Okavango River Bridge",
      asset_type_id: typeMap["Bridge"],
      description: "Reinforced concrete bridge spanning Okavango River, 120m length",
      address: "B8 Highway, Rundu",
      longitude: 19.7666,
      latitude: -17.9256,
      condition_rating: 2,
      construction_date: "1995-05-12",
      last_maintenance_date: "2023-06-10",
    },
    {
      asset_id: "BR-OS-003",
      name: "Oshakati Overpass",
      asset_type_id: typeMap["Bridge"],
      description: "Grade-separated interchange overpass, 60m span",
      address: "Main Road, Oshakati",
      longitude: 15.6881,
      latitude: -17.7875,
      condition_rating: 4,
      construction_date: "2015-08-01",
      last_maintenance_date: "2024-12-05",
    },
    {
      asset_id: "CU-WH-001",
      name: "Klein Windhoek Culvert",
      asset_type_id: typeMap["Culvert"],
      description: "Box culvert under Nelson Mandela Avenue, 3m x 2m cross-section",
      address: "Nelson Mandela Ave, Klein Windhoek",
      longitude: 17.1002,
      latitude: -22.5732,
      condition_rating: 3,
      construction_date: "2008-04-10",
      last_maintenance_date: "2024-06-15",
    },
    {
      asset_id: "CU-WH-002",
      name: "Avis Dam Overflow Culvert",
      asset_type_id: typeMap["Culvert"],
      description: "Multi-barrel culvert handling dam overflow during rainy season",
      address: "Avis Dam Road, Windhoek East",
      longitude: 17.1201,
      latitude: -22.5580,
      condition_rating: 1,
      construction_date: "1990-02-01",
      last_maintenance_date: "2021-08-20",
    },
    {
      asset_id: "SN-WH-001",
      name: "Speed Limit Sign - Independence Ave",
      asset_type_id: typeMap["Sign"],
      description: "60 km/h speed limit sign, reflective, post-mounted",
      address: "Independence Avenue at Fidel Castro St",
      longitude: 17.0841,
      latitude: -22.5635,
      condition_rating: 5,
      construction_date: "2023-01-15",
      last_maintenance_date: "2025-02-01",
    },
    {
      asset_id: "SN-WH-002",
      name: "Directional Sign - Airport Road",
      asset_type_id: typeMap["Sign"],
      description: "Large overhead gantry directional sign to Hosea Kutako Airport",
      address: "B6 Highway, Windhoek East",
      longitude: 17.1456,
      latitude: -22.5412,
      condition_rating: 4,
      construction_date: "2018-07-20",
      last_maintenance_date: "2024-09-10",
    },
    {
      asset_id: "GR-B1-001",
      name: "B1 Highway Guardrail - Auas Mountains",
      asset_type_id: typeMap["Guardrail"],
      description: "W-beam metal guardrail along mountain pass curve, 500m section",
      address: "B1 Highway, Auas Mountains Pass",
      longitude: 17.1100,
      latitude: -22.6500,
      condition_rating: 3,
      construction_date: "2005-11-01",
      last_maintenance_date: "2024-03-20",
    },
    {
      asset_id: "GR-B2-002",
      name: "B2 Guardrail - Bosua Pass",
      asset_type_id: typeMap["Guardrail"],
      description: "Steel guardrail protecting steep embankment drop-off, 300m",
      address: "B2 Highway, Bosua Pass",
      longitude: 15.8200,
      latitude: -22.4800,
      condition_rating: 2,
      construction_date: "2000-06-15",
      last_maintenance_date: "2022-10-01",
    },
    {
      asset_id: "TL-WH-001",
      name: "Traffic Light - Independence & Mandela",
      asset_type_id: typeMap["Traffic Light"],
      description: "4-way traffic signal intersection with pedestrian crossing phases",
      address: "Independence Ave & Nelson Mandela Ave, Windhoek",
      longitude: 17.0855,
      latitude: -22.5680,
      condition_rating: 5,
      construction_date: "2020-03-01",
      last_maintenance_date: "2025-01-15",
    },
    {
      asset_id: "TL-WH-002",
      name: "Traffic Light - Robert Mugabe & Tal St",
      asset_type_id: typeMap["Traffic Light"],
      description: "3-phase traffic signal with turning arrows",
      address: "Robert Mugabe Ave & Tal Street, Windhoek",
      longitude: 17.0830,
      latitude: -22.5720,
      condition_rating: 3,
      construction_date: "2015-09-10",
      last_maintenance_date: "2024-07-20",
    },
  ];

  console.log("\nInserting assets...");
  const insertedAssets = [];
  for (const asset of assetsData) {
    const result = await sql`
      INSERT INTO assets (asset_id, name, asset_type_id, description, address, longitude, latitude, condition_rating, construction_date, last_maintenance_date, status, approval_status, created_by, approved_by)
      VALUES (${asset.asset_id}, ${asset.name}, ${asset.asset_type_id}, ${asset.description}, ${asset.address}, ${asset.longitude}, ${asset.latitude}, ${asset.condition_rating}, ${asset.construction_date}, ${asset.last_maintenance_date}, 'active', 'approved', ${inspectorUser.id}, ${adminUser.id})
      ON CONFLICT (asset_id) DO UPDATE SET
        name = EXCLUDED.name,
        condition_rating = EXCLUDED.condition_rating,
        last_maintenance_date = EXCLUDED.last_maintenance_date,
        approval_status = 'approved',
        status = 'active'
      RETURNING id, asset_id, name
    `;
    insertedAssets.push(result[0]);
    console.log(`  + ${result[0].asset_id}: ${result[0].name}`);
  }

  // --- INSPECTIONS ---
  console.log("\nInserting inspections...");
  const inspectionsData = [
    {
      inspection_id: "INS-2025-001",
      asset_idx: 0,
      condition_rating: 4,
      findings: "Road surface in good condition. Minor crack sealing needed on southbound lane near Fidel Castro intersection.",
      recommendations: "Schedule preventive crack sealing within 3 months to prevent water infiltration.",
      weather_conditions: "Clear, 28°C",
      inspection_type: "routine",
      status: "approved",
    },
    {
      inspection_id: "INS-2025-002",
      asset_idx: 2,
      condition_rating: 2,
      findings: "Significant pothole damage on northbound lane. Heavy freight traffic causing accelerated deterioration. Base layer exposed in 3 locations.",
      recommendations: "Urgent rehabilitation needed. Recommend full resurfacing of 2km section. Temporary patching required immediately.",
      weather_conditions: "Overcast, 22°C",
      inspection_type: "emergency",
      status: "approved",
    },
    {
      inspection_id: "INS-2025-003",
      asset_idx: 4,
      condition_rating: 3,
      findings: "Bridge deck showing surface wear. Expansion joints functioning but seals degraded. Bearings need lubrication.",
      recommendations: "Replace expansion joint seals. Lubricate bearings. Schedule detailed structural inspection within 6 months.",
      weather_conditions: "Sunny, 32°C",
      inspection_type: "routine",
      status: "approved",
    },
    {
      inspection_id: "INS-2025-004",
      asset_idx: 5,
      condition_rating: 2,
      findings: "Scour observed at pier foundations. Concrete spalling on underside of deck. Rebar exposure at 2 locations.",
      recommendations: "Critical: Commission structural assessment. Install scour protection. Repair spalling and apply protective coating.",
      weather_conditions: "Partly cloudy, 30°C, river level high",
      inspection_type: "emergency",
      status: "approved",
    },
    {
      inspection_id: "INS-2025-005",
      asset_idx: 8,
      condition_rating: 1,
      findings: "Culvert severely blocked with debris and sediment (>80% blockage). Headwall cracking. Wingwall displacement observed.",
      recommendations: "Emergency clearing required before rainy season. Structural repair of headwall. Consider full replacement.",
      weather_conditions: "Clear, 25°C",
      inspection_type: "emergency",
      status: "approved",
    },
    {
      inspection_id: "INS-2025-006",
      asset_idx: 12,
      condition_rating: 2,
      findings: "Multiple guardrail sections damaged from vehicle impact. 3 posts bent, 2 sections of W-beam deformed. Reflectors missing.",
      recommendations: "Replace damaged sections immediately. Install new reflectors. Review if barrier height meets current standards.",
      weather_conditions: "Windy, 18°C",
      inspection_type: "follow_up",
      status: "submitted",
    },
    {
      inspection_id: "INS-2025-007",
      asset_idx: 14,
      condition_rating: 3,
      findings: "Signal timing operational but LED modules in amber phase showing reduced brightness. Controller cabinet seal degraded.",
      recommendations: "Replace amber LED modules. Re-seal controller cabinet. Update signal timing plan for peak hour congestion.",
      weather_conditions: "Clear, 26°C",
      inspection_type: "routine",
      status: "pending",
    },
  ];

  for (const insp of inspectionsData) {
    const asset = insertedAssets[insp.asset_idx];
    const result = await sql`
      INSERT INTO inspections (inspection_id, asset_id, inspector_id, condition_rating, findings, recommendations, weather_conditions, inspection_type, status, longitude, latitude, approved_by, approval_date)
      VALUES (${insp.inspection_id}, ${asset.id}, ${inspectorUser.id}, ${insp.condition_rating}, ${insp.findings}, ${insp.recommendations}, ${insp.weather_conditions}, ${insp.inspection_type}, ${insp.status}, ${assetsData[insp.asset_idx].longitude}, ${assetsData[insp.asset_idx].latitude}, ${insp.status === 'approved' ? adminUser.id : null}, ${insp.status === 'approved' ? new Date().toISOString() : null})
      ON CONFLICT (inspection_id) DO NOTHING
      RETURNING id, inspection_id
    `;
    if (result[0]) console.log(`  + ${result[0].inspection_id} for ${asset.name}`);
  }

  // --- WORK ORDERS ---
  console.log("\nInserting work orders...");
  const workOrdersData = [
    {
      work_order_id: "WO-2025-001",
      asset_idx: 2,
      title: "B1 Highway Emergency Pothole Repair",
      description: "Emergency patching of 3 exposed base-layer potholes on northbound lane. Temporary repair pending full resurfacing.",
      priority: "critical",
      work_type: "Emergency Repair",
      estimated_cost: 85000.00,
      actual_cost: 72500.00,
      scheduled_date: "2025-02-15",
      completed_date: "2025-02-18",
      status: "completed",
    },
    {
      work_order_id: "WO-2025-002",
      asset_idx: 2,
      title: "B1 Highway Full Resurfacing",
      description: "Complete resurfacing of 2km section of B1 northbound lane. Includes base layer repair, drainage improvement, and new asphalt overlay.",
      priority: "high",
      work_type: "Rehabilitation",
      estimated_cost: 2500000.00,
      scheduled_date: "2025-06-01",
      status: "approved",
    },
    {
      work_order_id: "WO-2025-003",
      asset_idx: 5,
      title: "Okavango River Bridge - Scour Protection",
      description: "Install riprap scour protection at pier foundations. Repair concrete spalling on deck underside. Apply protective coating to exposed rebar.",
      priority: "critical",
      work_type: "Structural Repair",
      estimated_cost: 1800000.00,
      scheduled_date: "2025-04-01",
      status: "in_progress",
    },
    {
      work_order_id: "WO-2025-004",
      asset_idx: 8,
      title: "Avis Dam Culvert Emergency Clearing",
      description: "Remove debris and sediment blockage from culvert. Repair cracked headwall. Realign displaced wingwall.",
      priority: "high",
      work_type: "Emergency Repair",
      estimated_cost: 350000.00,
      actual_cost: 410000.00,
      scheduled_date: "2025-01-20",
      completed_date: "2025-02-05",
      status: "completed",
    },
    {
      work_order_id: "WO-2025-005",
      asset_idx: 12,
      title: "B2 Guardrail Replacement",
      description: "Replace 3 bent posts, 2 deformed W-beam sections, and install new reflectors on Bosua Pass guardrail.",
      priority: "medium",
      work_type: "Replacement",
      estimated_cost: 125000.00,
      scheduled_date: "2025-03-15",
      status: "assigned",
    },
    {
      work_order_id: "WO-2025-006",
      asset_idx: 0,
      title: "Independence Avenue Crack Sealing",
      description: "Preventive crack sealing on southbound lane near Fidel Castro Street intersection. Apply rubberized asphalt sealant.",
      priority: "low",
      work_type: "Preventive Maintenance",
      estimated_cost: 45000.00,
      scheduled_date: "2025-05-01",
      status: "pending",
    },
    {
      work_order_id: "WO-2025-007",
      asset_idx: 4,
      title: "Robert Mugabe Bridge Joint Repair",
      description: "Replace degraded expansion joint seals. Lubricate bridge bearings. Clean drainage outlets.",
      priority: "medium",
      work_type: "Maintenance",
      estimated_cost: 180000.00,
      scheduled_date: "2025-04-15",
      status: "approved",
    },
  ];

  for (const wo of workOrdersData) {
    const asset = insertedAssets[wo.asset_idx];
    const result = await sql`
      INSERT INTO work_orders (work_order_id, asset_id, title, description, priority, work_type, estimated_cost, actual_cost, contractor_id, assigned_by, approved_by, scheduled_date, completed_date, status, approval_date)
      VALUES (${wo.work_order_id}, ${asset.id}, ${wo.title}, ${wo.description}, ${wo.priority}, ${wo.work_type}, ${wo.estimated_cost}, ${wo.actual_cost || null}, ${contractorUser.id}, ${adminUser.id}, ${wo.status !== 'pending' ? adminUser.id : null}, ${wo.scheduled_date}, ${wo.completed_date || null}, ${wo.status}, ${wo.status !== 'pending' ? new Date().toISOString() : null})
      ON CONFLICT (work_order_id) DO NOTHING
      RETURNING id, work_order_id
    `;
    if (result[0]) console.log(`  + ${result[0].work_order_id}: ${wo.title}`);
  }

  console.log("\n--- Demo data seeding complete! ---");
  console.log(`Assets: ${insertedAssets.length}`);
  console.log(`Inspections: ${inspectionsData.length}`);
  console.log(`Work Orders: ${workOrdersData.length}`);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
