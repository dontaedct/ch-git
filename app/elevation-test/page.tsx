"use client";

import { Surface, SurfaceCard, SurfaceElevated, SurfaceFloating, SurfaceSubtle } from "@/components/ui/surface";

export default function ElevationTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HT-002.1.1: Elevation Tokens Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SurfaceSubtle className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">Subtle</div>
              <div className="text-xs text-muted-foreground">Elevation 0</div>
            </div>
          </SurfaceSubtle>
          
          <SurfaceCard className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">Card</div>
              <div className="text-xs text-muted-foreground">Elevation 1</div>
            </div>
          </SurfaceCard>
          
          <SurfaceElevated className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">Elevated</div>
              <div className="text-xs text-muted-foreground">Elevation 2</div>
            </div>
          </SurfaceElevated>
          
          <SurfaceFloating className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">Floating</div>
              <div className="text-xs text-muted-foreground">Elevation 3</div>
            </div>
          </SurfaceFloating>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>✅ HT-002.1.1: Linear-style elevation tokens successfully implemented</p>
          <p>• 5 elevation levels (0-4) defined for light and dark modes</p>
          <p>• Tailwind shadow tokens configured</p>
          <p>• Surface component updated with elevation variants</p>
          <p>• New SurfaceFloating component added</p>
        </div>
      </div>
    </div>
  );
}
