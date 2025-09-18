/**
 * Template Builder Component
 * Interactive UI for creating and managing lesson templates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Download, 
  Upload, 
  Copy,
  Eye,
  Settings,
  BookOpen,
  Play,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { 
  TemplateBuilder as TemplateBuilderClass,
  TemplateSections,
  PredefinedTemplates,
  templateManager,
  LessonTemplate,
  TemplateSection,
  TemplateMetadata
} from '@/lib/templates/LessonTemplateSystem';

export interface TemplateBuilderProps {
  onTemplateCreated?: (template: LessonTemplate) => void;
  onTemplateSelected?: (template: LessonTemplate) => void;
  className?: string;
}

export function TemplateBuilder({ 
  onTemplateCreated, 
  onTemplateSelected,
  className = '' 
}: TemplateBuilderProps) {
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LessonTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allTemplates = templateManager.getAllTemplates();
    setTemplates(allTemplates);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || template.metadata.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.metadata.category)));

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: LessonTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelected?.(template);
  };

  const handleSaveTemplate = (template: LessonTemplate) => {
    templateManager.createTemplate(template);
    loadTemplates();
    setIsCreating(false);
    setSelectedTemplate(null);
    onTemplateCreated?.(template);
  };

  const handleDeleteTemplate = (id: string) => {
    templateManager.deleteTemplate(id);
    loadTemplates();
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const handleExportTemplate = (template: LessonTemplate) => {
    const jsonString = templateManager.exportTemplate(template.id);
    if (jsonString) {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lesson Templates</h1>
          <p className="text-gray-600">Create and manage reusable lesson templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Templates ({filteredTemplates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.metadata.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.metadata.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportTemplate(template);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Details/Editor */}
        <div className="lg:col-span-2">
          {isCreating ? (
            <TemplateEditor
              onSave={handleSaveTemplate}
              onCancel={() => setIsCreating(false)}
            />
          ) : selectedTemplate ? (
            <TemplateViewer
              template={selectedTemplate}
              onEdit={() => {
                setIsCreating(true);
                setSelectedTemplate(null);
              }}
              onExport={() => handleExportTemplate(selectedTemplate)}
            />
          ) : (
            <Card>
              <CardContent className="pt-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600">
                  Choose a template from the list to view its details and structure.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Template Editor Component
function TemplateEditor({ 
  onSave, 
  onCancel 
}: { 
  onSave: (template: LessonTemplate) => void;
  onCancel: () => void;
}) {
  const [builder] = useState(() => new TemplateBuilderClass('', ''));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);

  const addSection = (sectionType: string) => {
    let newSection: TemplateSection;

    switch (sectionType) {
      case 'introduction':
        newSection = TemplateSections.introduction();
        break;
      case 'content':
        newSection = TemplateSections.content('New Content Section', 10);
        break;
      case 'quiz':
        newSection = TemplateSections.quiz();
        break;
      case 'interactive':
        newSection = TemplateSections.interactive('drawing');
        break;
      case 'assessment':
        newSection = TemplateSections.assessment();
        break;
      case 'conclusion':
        newSection = TemplateSections.conclusion();
        break;
      default:
        return;
    }

    newSection.order = sections.length + 1;
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    // Reorder sections
    newSections.forEach((section, i) => {
      section.order = i + 1;
    });
    setSections(newSections);
  };

  const updateSection = (index: number, updates: Partial<TemplateSection>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  const handleSave = () => {
    const template = builder
      .setName(name)
      .setDescription(description)
      .setCategory(category)
      .setDifficulty(difficulty)
      .build();

    // Add sections
    sections.forEach(section => {
      builder.addSection(section);
    });

    // Add learning objectives
    learningObjectives.filter(obj => obj.trim()).forEach(obj => {
      builder.addLearningObjective(obj.trim());
    });

    // Add tags
    tags.filter(tag => tag.trim()).forEach(tag => {
      builder.addTag(tag.trim());
    });

    const finalTemplate = builder.build();
    onSave(finalTemplate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Language Arts">Language Arts</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the template purpose and use cases"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Learning Objectives</h3>
          {learningObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...learningObjectives];
                  newObjectives[index] = e.target.value;
                  setLearningObjectives(newObjectives);
                }}
                placeholder="Enter learning objective"
              />
              {learningObjectives.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newObjectives = learningObjectives.filter((_, i) => i !== index);
                    setLearningObjectives(newObjectives);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLearningObjectives([...learningObjectives, ''])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Template Sections</h3>
            <div className="flex gap-2">
              <Select onValueChange={addSection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction">Introduction</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="conclusion">Conclusion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{section.type}</Badge>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={!name || !description}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Viewer Component
function TemplateViewer({ 
  template, 
  onEdit, 
  onExport 
}: { 
  template: LessonTemplate;
  onEdit: () => void;
  onExport: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'metadata'>('overview');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{template.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm text-gray-600">{template.metadata.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Difficulty</Label>
                <p className="text-sm text-gray-600 capitalize">{template.metadata.difficulty}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estimated Duration</Label>
                <p className="text-sm text-gray-600">{template.metadata.estimatedDuration} minutes</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Sections</Label>
                <p className="text-sm text-gray-600">{template.structure.length}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Learning Objectives</Label>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                {template.metadata.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="space-y-3">
              {template.structure.map((section, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{section.type}</Badge>
                    <span className="font-medium">{section.title}</span>
                    {section.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Order: {section.order}</span>
                    {section.config.duration && <span>Duration: {section.config.duration}min</span>}
                    {section.config.slides && <span>Slides: {section.config.slides}</span>}
                    {section.config.questions && <span>Questions: {section.config.questions}</span>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-gray-600">{template.metadata.version}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Author</Label>
                <p className="text-sm text-gray-600">{template.metadata.author}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-600">
                  {new Date(template.metadata.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Updated</Label>
                <p className="text-sm text-gray-600">
                  {new Date(template.metadata.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Target Audience</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.metadata.targetAudience.map((audience, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

