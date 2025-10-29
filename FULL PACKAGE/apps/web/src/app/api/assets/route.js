import sql from "@/app/api/utils/sql";

/**
 * GET /api/assets - List all assets with optional filtering
 * Query parameters:
 * - type: Filter by asset type ID
 * - status: Filter by approval status
 * - condition: Filter by condition rating
 * - search: Search in name, asset_id, or address
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        a.id, a.asset_id, a.name, a.description, a.address,
        a.condition_rating, a.construction_date, a.last_maintenance_date,
        a.maintenance_interval_months, a.photos, a.status, a.approval_status,
        a.created_at, a.updated_at,
        ST_X(a.location) as longitude, ST_Y(a.location) as latitude,
        at.name as asset_type_name, at.icon, at.color,
        u1.name as created_by_name, u2.name as approved_by_name
      FROM assets a
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN users u1 ON a.created_by = u1.id
      LEFT JOIN users u2 ON a.approved_by = u2.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND a.asset_type_id = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND a.approval_status = $${paramCount}`;
      params.push(status);
    }

    if (condition) {
      paramCount++;
      query += ` AND a.condition_rating = $${paramCount}`;
      params.push(condition);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(a.name) LIKE LOWER($${paramCount}) OR 
        LOWER(a.asset_id) LIKE LOWER($${paramCount}) OR 
        LOWER(a.address) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const assets = await sql(query, params);
    return Response.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return Response.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

/**
 * POST /api/assets - Create a new asset
 * Body: Asset data with location coordinates
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      asset_id, name, asset_type_id, description, address,
      longitude, latitude, condition_rating, construction_date,
      maintenance_interval_months, photos, metadata, created_by
    } = body;

    // Validate required fields
    if (!asset_id || !name || !asset_type_id || !longitude || !latitude) {
      return Response.json(
        { error: 'Missing required fields: asset_id, name, asset_type_id, longitude, latitude' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO assets (
        asset_id, name, asset_type_id, description, address,
        location, condition_rating, construction_date,
        maintenance_interval_months, photos, metadata, created_by
      ) VALUES (
        ${asset_id}, ${name}, ${asset_type_id}, ${description}, ${address},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        ${condition_rating || 3}, ${construction_date},
        ${maintenance_interval_months || 12}, ${photos || []}, ${metadata},
        ${created_by}
      )
      RETURNING id, asset_id, name, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Asset ID already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}