import sql from "@/app/api/utils/sql";

/**
 * GET /api/asset-types - Get all asset types for dropdowns and filters
 */
export async function GET(request) {
  try {
    const assetTypes = await sql`
      SELECT id, name, description, icon, color
      FROM asset_types
      ORDER BY name
    `;

    return Response.json(assetTypes);
  } catch (error) {
    console.error('Error fetching asset types:', error);
    return Response.json({ error: 'Failed to fetch asset types' }, { status: 500 });
  }
}