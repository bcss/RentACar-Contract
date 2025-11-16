import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Palette } from 'lucide-react';

const designSamples = [
  {
    id: 'clean-modern',
    name: 'Clean Modern',
    description: 'Spacious layout with soft rounded corners and generous white space',
    features: ['Minimal design', 'Soft shadows', 'Large cards', 'Calm colors'],
    preview: '#1',
  },
  {
    id: 'data-dense',
    name: 'Data Dense',
    description: 'Maximum information density with compact layouts',
    features: ['Compact cards', 'More data visible', 'Efficient layout', 'Quick scanning'],
    preview: '#2',
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    description: 'Premium dark theme with subtle gradients and rich colors',
    features: ['Dark mode first', 'Gradient accents', 'Premium feel', 'Eye-friendly'],
    preview: '#3',
  },
  {
    id: 'minimal-cards',
    name: 'Minimal Cards',
    description: 'Clean hierarchy with essential information only',
    features: ['Focused content', 'Clear hierarchy', 'Less clutter', 'Easy to scan'],
    preview: '#4',
  },
  {
    id: 'colorful',
    name: 'Colorful Analytics',
    description: 'Vibrant colors with playful charts and visual emphasis',
    features: ['Bold colors', 'Visual charts', 'Engaging design', 'Data storytelling'],
    preview: '#5',
  },
];

export function DesignSamplesTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-semibold tracking-tight" data-testid="text-design-samples-title">
            Dashboard Design Samples
          </h2>
        </div>
        <p className="text-muted-foreground text-base leading-6" data-testid="text-design-samples-subtitle">
          Explore 5 professionally designed dashboard styles. Click "View Sample" to see each design in action, then choose your favorite.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">1.</span>
              <span>Click "View Sample" on each design to open it in a new tab</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">2.</span>
              <span>Explore the layout, colors, spacing, and overall feel of each design</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">3.</span>
              <span>Choose your favorite and let your development team know</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">4.</span>
              <span>The selected design will be applied to all dashboard tabs</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Design Samples Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designSamples.map((sample, index) => (
          <Card
            key={sample.id}
            className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
            data-testid={`card-design-${sample.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{sample.preview}</span>
                    </div>
                    <CardTitle className="text-lg">{sample.name}</CardTitle>
                  </div>
                  <CardDescription className="mt-2 leading-relaxed">
                    {sample.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Key Features
                </p>
                <div className="flex flex-wrap gap-2">
                  {sample.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs font-normal">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* View Button */}
              <Link href={`/dashboard-samples#${sample.id}`} target="_blank">
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  data-testid={`button-view-${sample.id}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Sample
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Info */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Need a Custom Design?</CardTitle>
          <CardDescription>
            If none of these designs match your vision, you can request a custom design tailored to your specific needs and brand identity.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
