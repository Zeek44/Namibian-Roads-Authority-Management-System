import sql from "@/app/api/utils/sql";

/**
 * GET /api/inspections - List all inspections with optional filtering
 * Query parameters:
 * - asset_id: Filter by asset ID
 * - inspector_id: Filter by inspector ID
 * - status: Filter by inspection status
 * - type: Filter by inspection type
 * - from_date: Filter inspections from this date
 * - to_date: Filter inspections until this date
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const inspector_id = searchParams.get('inspector_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    let query = `
      SELECT 
        i.id, i.inspection_id, i.inspection_date, i.condition_rating,
        i.findings, i.recommendations, i.photos, i.weather_conditions,
        i.inspection_type, i.status, i.approval_date, i.rejection_reason,
        i.created_at, i.updated_at,
        i.longitude, i.latitude,
        a.asset_id, a.name as asset_name, a.address as asset_address,
        at.name as asset_type_name, at.icon as asset_icon, at.color as asset_color,
        u1.name as inspector_name, u1.email as inspector_email,
        u2.name as approved_by_name
      FROM inspections i
      LEFT JOIN assets a ON i.asset_id = a.id
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN users u1 ON i.inspector_id = u1.id
      LEFT JOIN users u2 ON i.approved_by = u2.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (asset_id) {
      paramCount++;
      query += ` AND i.asset_id = $${paramCount}`;
      params.push(asset_id);
    }

    if (inspector_id) {
      paramCount++;
      query += ` AND i.inspector_id = $${paramCount}`;
      params.push(inspector_id);
    }

    if (status) {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND i.inspection_type = $${paramCount}`;
      params.push(type);
    }

    if (from_date) {
      paramCount++;
      query += ` AND i.inspection_date >= $${paramCount}`;
      params.push(from_date);
    }

    if (to_date) {
      paramCount++;
      query += ` AND i.inspection_date <= $${paramCount}`;
      params.push(to_date);
    }

    query += ` ORDER BY i.inspection_date DESC`;

    const inspections = await sql(query, params);
    return Response.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return Response.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

/**
 * POST /api/inspections - Create a new inspection
 * Body: Inspection data with GPS coordinates
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      inspection_id, asset_id, inspector_id, condition_rating,
      findings, recommendations, photos, longitude, latitude,
      weather_conditions, inspection_type
    } = body;

    // Validate required fields
    if (!inspection_id || !asset_id || !inspector_id) {
      return Response.json(
        { error: 'Missing required fields: inspection_id, asset_id, inspector_id' },
        { status: 400 }
      );
    }

    // Validate condition rating if provided
    if (condition_rating && (condition_rating < 1 || condition_rating > 5)) {
      return Response.json(
        { error: 'Condition rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO inspections (
        inspection_id, asset_id, inspector_id, condition_rating,
        findings, recommendations, photos, longitude, latitude,
        weather_conditions, inspection_type
      ) VALUES (
        ${inspection_id}, ${asset_id}, ${inspector_id}, ${condition_rating},
        ${findings}, ${recommendations}, ${photos || []},
        ${longitude || null}, ${latitude || null},
        ${weather_conditions}, ${inspection_type || 'routine'}
      )
      RETURNING id, inspection_id, inspection_date, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating inspection:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Inspection ID already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create inspection' }, { status: 500 });
  }
}