import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export default function DesignSystemLibrary() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="page-design-system-library">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-title">{t('designSystemLibrary.title')}</h1>
        <p className="text-muted-foreground" data-testid="text-subtitle">{t('designSystemLibrary.subtitle')}</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="typography" data-testid="tabs-main">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 w-full" data-testid="tabs-list">
          <TabsTrigger value="typography" data-testid="tab-typography">{t('designSystemLibrary.typography')}</TabsTrigger>
          <TabsTrigger value="colors" data-testid="tab-colors">{t('designSystemLibrary.colors')}</TabsTrigger>
          <TabsTrigger value="buttons" data-testid="tab-buttons">{t('designSystemLibrary.buttons')}</TabsTrigger>
          <TabsTrigger value="forms" data-testid="tab-forms">{t('designSystemLibrary.forms')}</TabsTrigger>
          <TabsTrigger value="cards" data-testid="tab-cards">{t('designSystemLibrary.cards')}</TabsTrigger>
          <TabsTrigger value="tables" data-testid="tab-tables">{t('designSystemLibrary.tables')}</TabsTrigger>
          <TabsTrigger value="status" data-testid="tab-status">{t('designSystemLibrary.status')}</TabsTrigger>
          <TabsTrigger value="navigation" data-testid="tab-navigation">{t('designSystemLibrary.navigation')}</TabsTrigger>
        </TabsList>

        {/* Typography Section */}
        <TabsContent value="typography" className="space-y-6" data-testid="content-typography">
          <Card data-testid="card-typography">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.typography')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.typographyDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-3xl font-bold</p>
                  <h1 className="text-3xl font-bold" data-testid="heading-1">{t('designSystemLibrary.heading1')}</h1>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-2xl font-semibold</p>
                  <h2 className="text-2xl font-semibold" data-testid="heading-2">{t('designSystemLibrary.heading2')}</h2>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-xl font-semibold</p>
                  <h3 className="text-xl font-semibold" data-testid="heading-3">{t('designSystemLibrary.heading3')}</h3>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-lg font-medium</p>
                  <h4 className="text-lg font-medium" data-testid="heading-4">{t('designSystemLibrary.heading4')}</h4>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-base</p>
                  <p className="text-base" data-testid="body-text">{t('designSystemLibrary.body')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('designSystemLibrary.textStyleLabel')}: text-sm text-muted-foreground</p>
                  <p className="text-sm text-muted-foreground" data-testid="caption-text">{t('designSystemLibrary.caption')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Section */}
        <TabsContent value="colors" className="space-y-6" data-testid="content-colors">
          <Card data-testid="card-colors">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.colors')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.colorsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-md" data-testid="color-primary"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.primary')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.primaryColorDesc')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-secondary rounded-md" data-testid="color-secondary"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.secondary')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.secondaryColorDesc')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-accent rounded-md" data-testid="color-accent"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.accent')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.accentColorDesc')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-muted rounded-md" data-testid="color-muted"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.muted')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.mutedColorDesc')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-card border rounded-md" data-testid="color-card"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.cards')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.cardsDesc')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-background border rounded-md" data-testid="color-background"></div>
                  <p className="text-sm font-medium">{t('common.background')}</p>
                  <p className="text-xs text-muted-foreground">{t('common.background')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-destructive rounded-md" data-testid="color-destructive"></div>
                  <p className="text-sm font-medium">{t('designSystemLibrary.destructive')}</p>
                  <p className="text-xs text-muted-foreground">{t('designSystemLibrary.error')}</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 border rounded-md flex items-center justify-center" data-testid="color-border">
                    <p className="text-xs text-muted-foreground">{t('common.border')}</p>
                  </div>
                  <p className="text-sm font-medium">{t('common.border')}</p>
                  <p className="text-xs text-muted-foreground">{t('common.border')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buttons Section */}
        <TabsContent value="buttons" className="space-y-6" data-testid="content-buttons">
          <Card data-testid="card-buttons">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.buttons')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.buttonsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" data-testid="button-default">{t('designSystemLibrary.default')}</Button>
                  <Button variant="secondary" data-testid="button-secondary">{t('designSystemLibrary.secondary')}</Button>
                  <Button variant="outline" data-testid="button-outline">{t('designSystemLibrary.outline')}</Button>
                  <Button variant="ghost" data-testid="button-ghost">{t('designSystemLibrary.ghost')}</Button>
                  <Button variant="destructive" data-testid="button-destructive">{t('designSystemLibrary.destructive')}</Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Sizes</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" data-testid="button-small">{t('designSystemLibrary.small')}</Button>
                  <Button size="default" data-testid="button-medium">{t('designSystemLibrary.medium')}</Button>
                  <Button size="lg" data-testid="button-large">{t('designSystemLibrary.large')}</Button>
                </div>
              </div>

              {/* States */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t('common.states')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Button data-testid="button-enabled">{t('common.enabled')}</Button>
                  <Button disabled data-testid="button-disabled">{t('common.disabled')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Section */}
        <TabsContent value="forms" className="space-y-6" data-testid="content-forms">
          <Card data-testid="card-forms">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.forms')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.formsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="text-input">{t('designSystemLibrary.textInput')}</Label>
                <Input id="text-input" placeholder="Enter text..." data-testid="input-text" />
              </div>

              {/* Select */}
              <div className="space-y-2">
                <Label htmlFor="select-input">{t('designSystemLibrary.select')}</Label>
                <Select>
                  <SelectTrigger id="select-input" data-testid="select-dropdown">
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1" data-testid="select-option-1">{t('designSystemLibrary.option1')}</SelectItem>
                    <SelectItem value="option2" data-testid="select-option-2">{t('designSystemLibrary.option2')}</SelectItem>
                    <SelectItem value="option3" data-testid="select-option-3">{t('designSystemLibrary.option3')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <Label htmlFor="textarea-input">{t('designSystemLibrary.textarea')}</Label>
                <Textarea id="textarea-input" placeholder="Enter multi-line text..." data-testid="textarea-input" />
              </div>

              {/* Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-input" data-testid="checkbox-input" />
                <Label htmlFor="checkbox-input">{t('designSystemLibrary.checkbox')}</Label>
              </div>

              {/* Radio Group */}
              <div className="space-y-2">
                <Label>{t('designSystemLibrary.radio')}</Label>
                <RadioGroup defaultValue="option1" data-testid="radio-group">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" data-testid="radio-option-1" />
                    <Label htmlFor="radio1">{t('designSystemLibrary.option1')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" data-testid="radio-option-2" />
                    <Label htmlFor="radio2">{t('designSystemLibrary.option2')}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switch */}
              <div className="flex items-center space-x-2">
                <Switch id="switch-input" data-testid="switch-input" />
                <Label htmlFor="switch-input">{t('designSystemLibrary.switch')}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Section */}
        <TabsContent value="cards" className="space-y-6" data-testid="content-cards">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Simple Card */}
            <Card data-testid="card-simple">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{t('designSystemLibrary.simpleCard')}</h3>
                <p className="text-sm text-muted-foreground">
                  Basic card with content only. No header or footer.
                </p>
              </CardContent>
            </Card>

            {/* Card with Header */}
            <Card data-testid="card-with-header">
              <CardHeader>
                <CardTitle>{t('designSystemLibrary.cardWithHeader')}</CardTitle>
                <CardDescription>Subtitle or description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Card content goes here with a proper header and description.</p>
              </CardContent>
            </Card>

            {/* Interactive Card */}
            <Card className="hover-elevate cursor-pointer" data-testid="card-interactive">
              <CardHeader>
                <CardTitle>{t('designSystemLibrary.interactiveCard')}</CardTitle>
                <CardDescription>Clickable with hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This card has hover elevation effect.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" data-testid="button-card-action">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tables Section */}
        <TabsContent value="tables" className="space-y-6" data-testid="content-tables">
          <Card data-testid="card-table">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.basicTable')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.tablesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="th-id">ID</TableHead>
                    <TableHead data-testid="th-name">{t('designSystemLibrary.name')}</TableHead>
                    <TableHead data-testid="th-status">{t('designSystemLibrary.status')}</TableHead>
                    <TableHead data-testid="th-actions">{t('designSystemLibrary.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow data-testid="row-1">
                    <TableCell data-testid="cell-id-1">001</TableCell>
                    <TableCell data-testid="cell-name-1">Item 1</TableCell>
                    <TableCell data-testid="cell-status-1">
                      <Badge data-testid="badge-status-1">{t('designSystemLibrary.active')}</Badge>
                    </TableCell>
                    <TableCell data-testid="cell-actions-1">
                      <Button variant="ghost" size="sm" data-testid="button-view-1">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow data-testid="row-2">
                    <TableCell data-testid="cell-id-2">002</TableCell>
                    <TableCell data-testid="cell-name-2">Item 2</TableCell>
                    <TableCell data-testid="cell-status-2">
                      <Badge variant="secondary" data-testid="badge-status-2">Pending</Badge>
                    </TableCell>
                    <TableCell data-testid="cell-actions-2">
                      <Button variant="ghost" size="sm" data-testid="button-view-2">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow data-testid="row-3">
                    <TableCell data-testid="cell-id-3">003</TableCell>
                    <TableCell data-testid="cell-name-3">Item 3</TableCell>
                    <TableCell data-testid="cell-status-3">
                      <Badge variant="outline" data-testid="badge-status-3">Completed</Badge>
                    </TableCell>
                    <TableCell data-testid="cell-actions-3">
                      <Button variant="ghost" size="sm" data-testid="button-view-3">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Indicators Section */}
        <TabsContent value="status" className="space-y-6" data-testid="content-status">
          {/* Badges */}
          <Card data-testid="card-badges">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.badges')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.statusDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge data-testid="badge-default">{t('designSystemLibrary.default')}</Badge>
                <Badge variant="secondary" data-testid="badge-secondary">{t('designSystemLibrary.secondary')}</Badge>
                <Badge variant="outline" data-testid="badge-outline">{t('designSystemLibrary.outline')}</Badge>
                <Badge variant="destructive" data-testid="badge-destructive">{t('designSystemLibrary.destructive')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card data-testid="card-alerts">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.alerts')}</CardTitle>
              <CardDescription>Alert messages and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert data-testid="alert-info">
                <Info className="h-4 w-4" />
                <AlertTitle>{t('designSystemLibrary.info')}</AlertTitle>
                <AlertDescription>{t('designSystemLibrary.info')}</AlertDescription>
              </Alert>

              <Alert className="border-green-600" data-testid="alert-success">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">{t('designSystemLibrary.success')}</AlertTitle>
                <AlertDescription>{t('designSystemLibrary.success')}</AlertDescription>
              </Alert>

              <Alert variant="destructive" data-testid="alert-error">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{t('designSystemLibrary.error')}</AlertTitle>
                <AlertDescription>{t('designSystemLibrary.error')}</AlertDescription>
              </Alert>

              <Alert className="border-yellow-600" data-testid="alert-warning">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-600">{t('designSystemLibrary.warning')}</AlertTitle>
                <AlertDescription>{t('designSystemLibrary.warning')}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Section */}
        <TabsContent value="navigation" className="space-y-6" data-testid="content-navigation">
          <Card data-testid="card-navigation">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.tabs')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.navigationDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" data-testid="tabs-example">
                <TabsList data-testid="tabs-example-list">
                  <TabsTrigger value="tab1" data-testid="tab-example-1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2" data-testid="tab-example-2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3" data-testid="tab-example-3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4" data-testid="content-tab-1">
                  <p className="text-sm">Content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4" data-testid="content-tab-2">
                  <p className="text-sm">Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4" data-testid="content-tab-3">
                  <p className="text-sm">Content for Tab 3</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card data-testid="card-breadcrumbs">
            <CardHeader>
              <CardTitle>{t('designSystemLibrary.breadcrumbs')}</CardTitle>
              <CardDescription>{t('designSystemLibrary.navigationDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <nav aria-label="Breadcrumb" data-testid="breadcrumb-nav">
                <ol className="flex items-center space-x-2 text-sm">
                  <li data-testid="breadcrumb-home">
                    <a href="#" className="text-primary hover:underline">{t('designSystemLibrary.home')}</a>
                  </li>
                  <li className="text-muted-foreground">/</li>
                  <li data-testid="breadcrumb-category">
                    <a href="#" className="text-primary hover:underline">{t('designSystemLibrary.products')}</a>
                  </li>
                  <li className="text-muted-foreground">/</li>
                  <li data-testid="breadcrumb-current" className="text-muted-foreground">Current Page</li>
                </ol>
              </nav>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Principles */}
      <Card data-testid="card-principles">
        <CardHeader>
          <CardTitle>Design Principles</CardTitle>
          <CardDescription>Core principles guiding the design system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Consistency</h4>
            <p className="text-sm text-muted-foreground">
              Use the same components and patterns throughout the application for similar functionality.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Accessibility</h4>
            <p className="text-sm text-muted-foreground">
              All components meet WCAG 2.1 AA standards with proper color contrast and keyboard navigation.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Bilingual Support</h4>
            <p className="text-sm text-muted-foreground">
              Full RTL/LTR support for English and Arabic with proper text alignment and layout mirroring.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Material Design 3</h4>
            <p className="text-sm text-muted-foreground">
              Based on Material Design 3 principles with custom adaptations for rental car management workflows.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
