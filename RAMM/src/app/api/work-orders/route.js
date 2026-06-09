import sql from "@/app/api/utils/sql";

/**
 * GET /api/work-orders - List all work orders with optional filtering
 * Query parameters:
 * - asset_id: Filter by asset ID
 * - contractor_id: Filter by contractor ID
 * - status: Filter by work order status
 * - priority: Filter by priority level
 * - work_type: Filter by work type
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const contractor_id = searchParams.get('contractor_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const work_type = searchParams.get('work_type');

    let query = `
      SELECT 
        w.id, w.work_order_id, w.title, w.description, w.priority,
        w.work_type, w.estimated_cost, w.actual_cost, w.scheduled_date,
        w.completed_date, w.status, w.approval_date, w.rejection_reason,
        w.completion_photos, w.completion_notes, w.created_at, w.updated_at,
        a.asset_id, a.name as asset_name, a.address as asset_address,
        at.name as asset_type_name, at.icon as asset_icon, at.color as asset_color,
        i.inspection_id, i.findings as inspection_findings,
        u1.name as contractor_name, u1.email as contractor_email, u1.organization as contractor_org,
        u2.name as assigned_by_name,
        u3.name as approved_by_name
      FROM work_orders w
      LEFT JOIN assets a ON w.asset_id = a.id
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN inspections i ON w.inspection_id = i.id
      LEFT JOIN users u1 ON w.contractor_id = u1.id
      LEFT JOIN users u2 ON w.assigned_by = u2.id
      LEFT JOIN users u3 ON w.approved_by = u3.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (asset_id) {
      paramCount++;
      query += ` AND w.asset_id = $${paramCount}`;
      params.push(asset_id);
    }

    if (contractor_id) {
      paramCount++;
      query += ` AND w.contractor_id = $${paramCount}`;
      params.push(contractor_id);
    }

    if (status) {
      paramCount++;
      query += ` AND w.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND w.priority = $${paramCount}`;
      params.push(priority);
    }

    if (work_type) {
      paramCount++;
      query += ` AND w.work_type = $${paramCount}`;
      params.push(work_type);
    }

    query += ` ORDER BY 
      CASE w.priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      w.scheduled_date ASC NULLS LAST,
      w.created_at DESC
    `;

    const workOrders = await sql(query, params);
    return Response.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return Response.json({ error: 'Failed to fetch work orders' }, { status: 500 });
  }
}

/**
 * POST /api/work-orders - Create a new work order
 * Body: Work order data
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      work_order_id, asset_id, inspection_id, title, description,
      priority, work_type, estimated_cost, contractor_id,
      assigned_by, scheduled_date
    } = body;

    // Validate required fields
    if (!work_order_id || !asset_id || !title || !work_type || !assigned_by) {
      return Response.json(
        { error: 'Missing required fields: work_order_id, asset_id, title, work_type, assigned_by' },
        { status: 400 }
      );
    }

    // Validate contractor role if contractor_id provided
    if (contractor_id) {
      const contractorCheck = await sql`
        SELECT role FROM users WHERE id = ${contractor_id}
      `;

      if (contractorCheck.length === 0 || contractorCheck[0].role !== 'contractor') {
        return Response.json(
          { error: 'Invalid contractor ID - user must have contractor role' },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      INSERT INTO work_orders (
        work_order_id, asset_id, inspection_id, title, description,
        priority, work_type, estimated_cost, contractor_id,
        assigned_by, scheduled_date
      ) VALUES (
        ${work_order_id}, ${asset_id}, ${inspection_id}, ${title}, ${description},
        ${priority || 'medium'}, ${work_type}, ${estimated_cost}, ${contractor_id},
        ${assigned_by}, ${scheduled_date}
      )
      RETURNING id, work_order_id, title, status, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating work order:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Work order ID already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}