/**
 * Service Package Management API
 *
 * RESTful API endpoints for CRUD operations on service packages,
 * including validation, search, and bulk operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { servicePackageManager } from '@/lib/consultation/service-packages';
import type { ServicePackage } from '@/lib/ai/consultation-generator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/service-packages
 * Retrieve service packages with optional filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tier = searchParams.get('tier') as 'foundation' | 'growth' | 'enterprise' | null;
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');

    let packages = servicePackageManager.getAllPackages();

    // Apply filters
    if (category) {
      packages = packages.filter(pkg => pkg.category === category);
    }

    if (tier) {
      packages = packages.filter(pkg => pkg.tier === tier);
    }

    if (industry) {
      packages = packages.filter(pkg =>
        pkg.industry_tags.some(tag =>
          tag.toLowerCase().includes(industry.toLowerCase())
        )
      );
    }

    if (search) {
      packages = servicePackageManager.searchPackages(search);
    }

    // Get additional metadata
    const categories = servicePackageManager.getAllCategories();
    const templates = servicePackageManager.getAllTemplates();
    const stats = servicePackageManager.getPackageStats();

    return NextResponse.json({
      success: true,
      data: {
        packages,
        categories,
        templates,
        stats,
        total: packages.length
      }
    });
  } catch (error) {
    console.error('Error fetching service packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch service packages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/service-packages
 * Create a new service package
 */
export async function POST(request: NextRequest) {
  try {
    const packageData = await request.json();

    // Validate required fields
    if (!packageData.title || !packageData.description || !packageData.category || !packageData.tier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['title', 'description', 'category', 'tier']
        },
        { status: 400 }
      );
    }

    // Create the package
    const newPackage = servicePackageManager.createPackage(packageData);

    return NextResponse.json({
      success: true,
      data: newPackage,
      message: 'Service package created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create service package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/admin/service-packages
 * Update an existing service package
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required'
        },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const updatedPackage = servicePackageManager.updatePackage(id, updates);

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: 'Service package updated successfully'
    });
  } catch (error) {
    console.error('Error updating service package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update service package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/service-packages
 * Delete a service package
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required'
        },
        { status: 400 }
      );
    }

    const deleted = servicePackageManager.deletePackage(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service package not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete service package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}