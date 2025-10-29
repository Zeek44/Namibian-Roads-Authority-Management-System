import sql from "@/app/api/utils/sql";

/**
 * POST /api/inspections/[id]/approve - Approve an inspection (admin only)
 * Body: { approved_by: admin_user_id }
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { approved_by } = body;

    if (!approved_by) {
      return Response.json(
        { error: 'Missing required field: approved_by' },
        { status: 400 }
      );
    }

    // Verify the approver is an admin
    const adminCheck = await sql`
      SELECT role FROM users WHERE id = ${approved_by}
    `;

    if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return Response.json(
        { error: 'Only admin users can approve inspections' },
        { status: 403 }
      );
    }

    // Update inspection status to approved
    const result = await sql`
      UPDATE inspections 
      SET 
        status = 'approved',
        approved_by = ${approved_by},
        approval_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND status = 'submitted'
      RETURNING id, inspection_id, status, approval_date
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Inspection not found or not in submitted status' },
        { status: 404 }
      );
    }

    // Update the asset's condition rating if this is the latest approved inspection
    const assetUpdate = await sql`
      UPDATE assets a
      SET 
        condition_rating = i.condition_rating,
        last_maintenance_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
      FROM inspections i
      WHERE a.id = i.asset_id 
        AND i.id = ${id}
        AND i.condition_rating IS NOT NULL
      RETURNING a.id, a.asset_id, a.condition_rating
    `;

    return Response.json({
      message: 'Inspection approved successfully',
      inspection: result[0],
      asset_updated: assetUpdate.length > 0 ? assetUpdate[0] : null
    });
  } catch (error) {
    console.error('Error approving inspection:', error);
    return Response.json({ error: 'Failed to approve inspection' }, { status: 500 });
  }
}