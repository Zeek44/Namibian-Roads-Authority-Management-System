import sql from "@/app/api/utils/sql";

/**
 * GET /api/reports - Generate various reports for the RAMMS system
 * Query parameters:
 * - type: Report type ('assets', 'inspections', 'work_orders', 'summary')
 * - format: Output format ('json', 'csv')
 * - from_date: Start date for filtering
 * - to_date: End date for filtering
 * - asset_type: Filter by asset type
 * - condition: Filter by condition rating
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const format = searchParams.get('format') || 'json';
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const asset_type = searchParams.get('asset_type');
    const condition = searchParams.get('condition');

    let reportData;

    switch (type) {
      case 'assets':
        reportData = await generateAssetsReport({ from_date, to_date, asset_type, condition });
        break;
      case 'inspections':
        reportData = await generateInspectionsReport({ from_date, to_date, asset_type });
        break;
      case 'work_orders':
        reportData = await generateWorkOrdersReport({ from_date, to_date, asset_type });
        break;
      case 'summary':
        reportData = await generateSummaryReport({ from_date, to_date });
        break;
      default:
        return Response.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData, type);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return Response.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateAssetsReport({ from_date, to_date, asset_type, condition }) {
  let query = `
    SELECT 
      a.asset_id,
      a.name,
      at.name as asset_type,
      a.address,
      a.condition_rating,
      a.construction_date,
      a.last_maintenance_date,
      a.maintenance_interval_months,
      a.status,
      a.approval_status,
      a.longitude,
      a.latitude,
      u1.name as created_by_name,
      u2.name as approved_by_name,
      a.created_at,
      a.updated_at
    FROM assets a
    LEFT JOIN asset_types at ON a.asset_type_id = at.id
    LEFT JOIN users u1 ON a.created_by = u1.id
    LEFT JOIN users u2 ON a.approved_by = u2.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (from_date) {
    paramCount++;
    query += ` AND a.created_at >= $${paramCount}`;
    params.push(from_date);
  }

  if (to_date) {
    paramCount++;
    query += ` AND a.created_at <= $${paramCount}`;
    params.push(to_date);
  }

  if (asset_type) {
    paramCount++;
    query += ` AND a.asset_type_id = $${paramCount}`;
    params.push(asset_type);
  }

  if (condition) {
    paramCount++;
    query += ` AND a.condition_rating = $${paramCount}`;
    params.push(condition);
  }

  query += ` ORDER BY a.created_at DESC`;

  return await sql(query, params);
}

async function generateInspectionsReport({ from_date, to_date, asset_type }) {
  let query = `
    SELECT 
      i.inspection_id,
      i.inspection_date,
      i.condition_rating,
      i.findings,
      i.recommendations,
      i.weather_conditions,
      i.inspection_type,
      i.status,
      a.asset_id,
      a.name as asset_name,
      at.name as asset_type,
      u1.name as inspector_name,
      u2.name as approved_by_name,
      i.approval_date,
      i.longitude,
      i.latitude
    FROM inspections i
    LEFT JOIN assets a ON i.asset_id = a.id
    LEFT JOIN asset_types at ON a.asset_type_id = at.id
    LEFT JOIN users u1 ON i.inspector_id = u1.id
    LEFT JOIN users u2 ON i.approved_by = u2.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

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

  if (asset_type) {
    paramCount++;
    query += ` AND a.asset_type_id = $${paramCount}`;
    params.push(asset_type);
  }

  query += ` ORDER BY i.inspection_date DESC`;

  return await sql(query, params);
}

async function generateWorkOrdersReport({ from_date, to_date, asset_type }) {
  let query = `
    SELECT 
      w.work_order_id,
      w.title,
      w.description,
      w.priority,
      w.work_type,
      w.estimated_cost,
      w.actual_cost,
      w.scheduled_date,
      w.completed_date,
      w.status,
      a.asset_id,
      a.name as asset_name,
      at.name as asset_type,
      u1.name as contractor_name,
      u2.name as assigned_by_name,
      u3.name as approved_by_name,
      w.approval_date
    FROM work_orders w
    LEFT JOIN assets a ON w.asset_id = a.id
    LEFT JOIN asset_types at ON a.asset_type_id = at.id
    LEFT JOIN users u1 ON w.contractor_id = u1.id
    LEFT JOIN users u2 ON w.assigned_by = u2.id
    LEFT JOIN users u3 ON w.approved_by = u3.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  if (from_date) {
    paramCount++;
    query += ` AND w.created_at >= $${paramCount}`;
    params.push(from_date);
  }

  if (to_date) {
    paramCount++;
    query += ` AND w.created_at <= $${paramCount}`;
    params.push(to_date);
  }

  if (asset_type) {
    paramCount++;
    query += ` AND a.asset_type_id = $${paramCount}`;
    params.push(asset_type);
  }

  query += ` ORDER BY w.created_at DESC`;

  return await sql(query, params);
}

async function generateSummaryReport({ from_date, to_date }) {
  // Get period constraints
  let dateFilter = '';
  const params = [];
  let paramCount = 0;

  if (from_date || to_date) {
    if (from_date) {
      paramCount++;
      dateFilter += ` AND created_at >= $${paramCount}`;
      params.push(from_date);
    }
    if (to_date) {
      paramCount++;
      dateFilter += ` AND created_at <= $${paramCount}`;
      params.push(to_date);
    }
  }

  const [
    assetSummary,
    inspectionSummary,
    workOrderSummary,
    conditionSummary,
    monthlySummary
  ] = await sql.transaction([
    // Asset summary
    sql`
      SELECT 
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE approval_status = 'approved') as approved_assets,
        COUNT(*) FILTER (WHERE approval_status = 'pending') as pending_assets,
        COUNT(*) FILTER (WHERE status = 'active') as active_assets
      FROM assets
      WHERE 1=1 ${dateFilter ? sql.unsafe(dateFilter) : sql``}
    `,
    
    // Inspection summary
    sql`
      SELECT 
        COUNT(*) as total_inspections,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_inspections,
        COUNT(*) FILTER (WHERE status = 'submitted') as submitted_inspections,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_inspections,
        AVG(condition_rating) as avg_condition_rating
      FROM inspections
      WHERE 1=1 ${dateFilter ? sql.unsafe(dateFilter) : sql``}
    `,
    
    // Work order summary
    sql`
      SELECT 
        COUNT(*) as total_work_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_work_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_work_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_work_orders,
        SUM(estimated_cost) as total_estimated_cost,
        SUM(actual_cost) as total_actual_cost
      FROM work_orders
      WHERE 1=1 ${dateFilter ? sql.unsafe(dateFilter) : sql``}
    `,
    
    // Condition rating distribution
    sql`
      SELECT 
        condition_rating,
        COUNT(*) as count,
        at.name as asset_type
      FROM assets a
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.approval_status = 'approved' AND a.status = 'active'
      GROUP BY condition_rating, at.name
      ORDER BY condition_rating DESC, at.name
    `,
    
    // Monthly activity summary (last 12 months)
    sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        'inspections' as activity_type,
        COUNT(*) as count
      FROM inspections
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      
      UNION ALL
      
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        'work_orders' as activity_type,
        COUNT(*) as count
      FROM work_orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      
      ORDER BY month DESC
    `
  ]);

  return {
    summary: {
      assets: assetSummary[0],
      inspections: inspectionSummary[0],
      work_orders: workOrderSummary[0]
    },
    condition_distribution: conditionSummary,
    monthly_activity: monthlySummary,
    generated_at: new Date().toISOString(),
    period: {
      from: from_date || 'All time',
      to: to_date || 'Present'
    }
  };
}

function convertToCSV(data, type) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available';
  }

  // Handle summary report differently
  if (type === 'summary') {
    let csv = 'RAMMS Summary Report\n\n';
    csv += 'Metric,Value\n';
    
    if (data.summary?.assets) {
      csv += `Total Assets,${data.summary.assets.total_assets}\n`;
      csv += `Approved Assets,${data.summary.assets.approved_assets}\n`;
      csv += `Pending Assets,${data.summary.assets.pending_assets}\n`;
      csv += `Active Assets,${data.summary.assets.active_assets}\n`;
    }
    
    if (data.summary?.inspections) {
      csv += `Total Inspections,${data.summary.inspections.total_inspections}\n`;
      csv += `Approved Inspections,${data.summary.inspections.approved_inspections}\n`;
      csv += `Average Condition Rating,${parseFloat(data.summary.inspections.avg_condition_rating || 0).toFixed(2)}\n`;
    }
    
    if (data.summary?.work_orders) {
      csv += `Total Work Orders,${data.summary.work_orders.total_work_orders}\n`;
      csv += `Completed Work Orders,${data.summary.work_orders.completed_work_orders}\n`;
      csv += `Total Estimated Cost,${data.summary.work_orders.total_estimated_cost || 0}\n`;
      csv += `Total Actual Cost,${data.summary.work_orders.total_actual_cost || 0}\n`;
    }
    
    return csv;
  }

  // Regular array data
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}