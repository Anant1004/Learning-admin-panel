"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';

type Subcategory = {
  id: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
  isExpanded?: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subcategoryForms, setSubcategoryForms] = useState<Record<string, {name: string; description: string}>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      setCategories(categories.map(cat => 
        cat.id === editingId 
          ? { 
              ...cat, 
              name: formData.name,
              description: formData.description 
            } 
          : cat
      ));
      setEditingId(null);
    } else {
      setCategories([...categories, {
        id: Date.now().toString(),
        ...formData,
        subcategories: [],
        isExpanded: false,
      }]);
    }
    setFormData({ name: '', description: '' });
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const toggleCategory = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const addSubcategory = (categoryId: string) => {
    const subcategory = subcategoryForms[categoryId];
    if (!subcategory?.name.trim()) return;

    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            subcategories: [
              ...cat.subcategories, 
              { 
                id: Date.now().toString(), 
                ...subcategory 
              }
            ] 
          } 
        : cat
    ));
    
    setSubcategoryForms({
      ...subcategoryForms,
      [categoryId]: { name: '', description: '' },
    });
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) 
          } 
        : cat
    ));
  };

  const startEditing = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setEditingId(category.id);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit Category' : 'Add New Category'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Category description"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                {editingId ? 'Update' : 'Add Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleCategory(category.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {category.isExpanded ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </button>
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 ml-7">{category.description}</p>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(category)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardHeader>
            
            {category.isExpanded && (
              <CardContent className="pt-0">
                <div className="mt-4 pl-7 border-t pt-4">
                  <h4 className="font-medium mb-3">Subcategories</h4>
                  
                  {/* Add Subcategory Form */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={subcategoryForms[category.id]?.name || ''}
                      onChange={(e) => setSubcategoryForms({
                        ...subcategoryForms,
                        [category.id]: {
                          ...(subcategoryForms[category.id] || { name: '', description: '' }),
                          name: e.target.value
                        }
                      })}
                      placeholder="New subcategory name"
                      className="flex-1"
                    />
                    <Input
                      value={subcategoryForms[category.id]?.description || ''}
                      onChange={(e) => setSubcategoryForms({
                        ...subcategoryForms,
                        [category.id]: {
                          ...(subcategoryForms[category.id] || { name: '', description: '' }),
                          description: e.target.value
                        }
                      })}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => addSubcategory(category.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Subcategories List */}
                  {category.subcategories.length > 0 ? (
                    <div className="space-y-2">
                      {category.subcategories.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{sub.name}</p>
                            {sub.description && (
                              <p className="text-sm text-gray-600">{sub.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubcategory(category.id, sub.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No subcategories yet. Add one above.</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
