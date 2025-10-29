import sql from "@/app/api/utils/sql";

/**
 * GET /api/assets/[id] - Get a specific asset by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const assets = await sql`
      SELECT 
        a.id, a.asset_id, a.name, a.description, a.address,
        a.condition_rating, a.construction_date, a.last_maintenance_date,
        a.maintenance_interval_months, a.photos, a.status, a.approval_status,
        a.created_at, a.updated_at, a.metadata,
        ST_X(a.location) as longitude, ST_Y(a.location) as latitude,
        at.name as asset_type_name, at.icon, at.color,
        u1.name as created_by_name, u2.name as approved_by_name
      FROM assets a
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN users u1 ON a.created_by = u1.id
      LEFT JOIN users u2 ON a.approved_by = u2.id
      WHERE a.id = ${id}
    `;

    if (assets.length === 0) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }

    return Response.json(assets[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return Response.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}

/**
 * PUT /api/assets/[id] - Update an asset
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    // List of allowed fields to update
    const allowedFields = [
      'name', 'description', 'address', 'condition_rating',
      'construction_date', 'last_maintenance_date', 'maintenance_interval_months',
      'photos', 'status', 'metadata'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    });

    // Handle location update if coordinates provided
    if (body.longitude !== undefined && body.latitude !== undefined) {
      paramCount++;
      updates.push(`location = ST_SetSRID(ST_MakePoint($${paramCount}, $${paramCount + 1}), 4326)`);
      values.push(body.longitude, body.latitude);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add ID parameter
    paramCount++;
    values.push(id);

    const query = `
      UPDATE assets 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, asset_id, name, updated_at
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating asset:', error);
    return Response.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

/**
 * DELETE /api/assets/[id] - Delete an asset (soft delete by changing status)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      UPDATE assets 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, asset_id, name
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }

    return Response.json({ message: 'Asset deactivated successfully', asset: result[0] });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return Response.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}