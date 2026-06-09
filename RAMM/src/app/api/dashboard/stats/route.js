import sql from "@/app/api/utils/sql";

/**
 * GET /api/dashboard/stats - Get dashboard statistics and metrics
 */
export async function GET(request) {
  try {
    // Get various statistics in parallel for better performance
    const [
      assetStats,
      inspectionStats,
      workOrderStats,
      pendingApprovals,
      criticalAssets,
      recentActivity
    ] = await Promise.all([
      // Asset statistics by type and condition
      sql`
        SELECT 
          at.name as asset_type,
          at.color,
          COUNT(*) as total_count,
          AVG(a.condition_rating) as avg_condition,
          COUNT(*) FILTER (WHERE a.condition_rating <= 2) as poor_condition_count,
          COUNT(*) FILTER (WHERE a.condition_rating >= 4) as good_condition_count
        FROM assets a
        LEFT JOIN asset_types at ON a.asset_type_id = at.id
        WHERE a.status = 'active' AND a.approval_status = 'approved'
        GROUP BY at.id, at.name, at.color
        ORDER BY total_count DESC
      `,
      
      // Inspection statistics
      sql`
        SELECT 
          COUNT(*) as total_inspections,
          COUNT(*) FILTER (WHERE status = 'pending' OR status = 'submitted') as pending_inspections,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_inspections,
          COUNT(*) FILTER (WHERE inspection_date >= CURRENT_DATE - INTERVAL '30 days') as recent_inspections
        FROM inspections
      `,
      
      // Work order statistics
      sql`
        SELECT 
          COUNT(*) as total_work_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_work_orders,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_work_orders,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_work_orders,
          SUM(estimated_cost) FILTER (WHERE status IN ('approved', 'assigned', 'in_progress')) as estimated_budget,
          SUM(actual_cost) FILTER (WHERE status = 'completed') as actual_spent
        FROM work_orders
      `,
      
      // Pending approvals count
      sql`
        SELECT 
          (SELECT COUNT(*) FROM assets WHERE approval_status = 'pending') as pending_assets,
          (SELECT COUNT(*) FROM inspections WHERE status = 'submitted') as pending_inspections,
          (SELECT COUNT(*) FROM work_orders WHERE status = 'pending') as pending_work_orders
      `,
      
      // Critical assets needing attention
      sql`
        SELECT 
          COUNT(*) as critical_assets
        FROM assets a
        WHERE a.status = 'active' 
          AND a.approval_status = 'approved'
          AND (
            a.condition_rating <= 2 
            OR a.last_maintenance_date < CURRENT_DATE - INTERVAL '2 years'
            OR a.last_maintenance_date IS NULL
          )
      `,
      
      // Recent activity summary
      sql`
        (SELECT 
          'inspection' as activity_type,
          i.inspection_id as reference_id,
          a.name as asset_name,
          u.name as user_name,
          i.created_at as activity_date,
          i.status
        FROM inspections i
        LEFT JOIN assets a ON i.asset_id = a.id
        LEFT JOIN users u ON i.inspector_id = u.id
        WHERE i.created_at >= CURRENT_DATE - INTERVAL '7 days')
        
        UNION ALL
        
        (SELECT 
          'work_order' as activity_type,
          w.work_order_id as reference_id,
          a.name as asset_name,
          u.name as user_name,
          w.created_at as activity_date,
          w.status
        FROM work_orders w
        LEFT JOIN assets a ON w.asset_id = a.id
        LEFT JOIN users u ON w.assigned_by = u.id
        WHERE w.created_at >= CURRENT_DATE - INTERVAL '7 days')
        
        ORDER BY activity_date DESC
        LIMIT 10
      `
    ]);

    // Calculate totals and percentages
    const totalAssets = assetStats.reduce((sum, stat) => sum + parseInt(stat.total_count), 0);
    const totalPendingApprovals = 
      parseInt(pendingApprovals[0]?.pending_assets || 0) + 
      parseInt(pendingApprovals[0]?.pending_inspections || 0) + 
      parseInt(pendingApprovals[0]?.pending_work_orders || 0);

    return Response.json({
      assets: {
        total: totalAssets,
        by_type: assetStats,
        critical_count: parseInt(criticalAssets[0]?.critical_assets || 0)
      },
      inspections: {
        ...inspectionStats[0],
        total_inspections: parseInt(inspectionStats[0]?.total_inspections || 0),
        pending_inspections: parseInt(inspectionStats[0]?.pending_inspections || 0),
        approved_inspections: parseInt(inspectionStats[0]?.approved_inspections || 0),
        recent_inspections: parseInt(inspectionStats[0]?.recent_inspections || 0)
      },
      work_orders: {
        ...workOrderStats[0],
        total_work_orders: parseInt(workOrderStats[0]?.total_work_orders || 0),
        pending_work_orders: parseInt(workOrderStats[0]?.pending_work_orders || 0),
        in_progress_work_orders: parseInt(workOrderStats[0]?.in_progress_work_orders || 0),
        completed_work_orders: parseInt(workOrderStats[0]?.completed_work_orders || 0),
        estimated_budget: parseFloat(workOrderStats[0]?.estimated_budget || 0),
        actual_spent: parseFloat(workOrderStats[0]?.actual_spent || 0)
      },
      pending_approvals: {
        total: totalPendingApprovals,
        assets: parseInt(pendingApprovals[0]?.pending_assets || 0),
        inspections: parseInt(pendingApprovals[0]?.pending_inspections || 0),
        work_orders: parseInt(pendingApprovals[0]?.pending_work_orders || 0)
      },
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
