import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, Lock, Mail, Phone, Calendar, Globe, MapPin,
  CreditCard, Building, Hash, DollarSign, Percent,
  FileText, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function FieldStyleShowcase() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Field Style Showcase
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-page-description">
              Minimal input pattern: Icon on left + transparent background + bottom border only
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            data-testid="button-back"
            className="rounded-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Unified Dark Input Theme (from fields-demo.html)</CardTitle>
            <CardDescription>
              Clean, minimal input fields with consistent bottom-border styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Text Inputs</h3>
              
              {/* Username */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Username"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-username"
                />
              </div>

              {/* Password with toggle */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-email"
                />
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-phone"
                />
              </div>
            </div>

            {/* Date & Number Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Date & Number Inputs</h3>
              
              {/* Date */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground"
                  data-testid="input-date"
                />
              </div>

              {/* Number */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-number"
                />
              </div>

              {/* Currency */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="0.00"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-currency"
                />
              </div>

              {/* Percentage */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-percentage"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Location & Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Location & Identity</h3>
              
              {/* Address */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Address"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-address"
                />
              </div>

              {/* Country/Region */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <select
                  className="flex-1 bg-transparent outline-none text-sm text-foreground appearance-none"
                  data-testid="select-country"
                >
                  <option value="" disabled selected className="text-muted-foreground">Select country</option>
                  <option value="ae">United Arab Emirates</option>
                  <option value="sa">Saudi Arabia</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                </select>
              </div>

              {/* Company */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Company name"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-company"
                />
              </div>

              {/* Credit Card */}
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Card number"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-card"
                />
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Textarea</h3>
              
              <div className="border-b border-border pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Notes</span>
                </div>
                <textarea
                  rows={3}
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none"
                  placeholder="Additional notes or comments"
                  data-testid="textarea-notes"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="rounded-none" data-testid="button-cancel">
                Cancel
              </Button>
              <Button className="rounded-none" data-testid="button-submit">
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Design Principles */}
        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
            <CardDescription>
              Key characteristics of this minimal input pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Icon on left:</strong> Visual cue for input type using lucide-react icons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Transparent background:</strong> Clean integration with card backgrounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Bottom border only:</strong> Minimalist aesthetic, no full box borders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Square buttons:</strong> Using rounded-none for consistent geometric design</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Muted icon color:</strong> Icons use text-muted-foreground to not compete with input text</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span><strong className="text-foreground">Consistent spacing:</strong> gap-3 between icon and input, pb-2 for bottom padding</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
