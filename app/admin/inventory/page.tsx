"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, FolderTree, Folder } from "lucide-react"

interface Subcategory {
  name: string
  description: string
}

interface Category {
  id: number
  name: string
  description: string
  subcategories: Subcategory[]
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [subcategoryName, setSubcategoryName] = useState("")
  const [subcategoryDescription, setSubcategoryDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const handleAddCategory = () => {
    if (!categoryName.trim()) return
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: categoryName,
        description: categoryDescription,
        subcategories: [],
      },
    ])
    setCategoryName("")
    setCategoryDescription("")
  }

  const handleAddSubcategory = () => {
    if (!subcategoryName.trim() || selectedCategory === null) return
    setCategories(
      categories.map((cat) =>
        cat.id === selectedCategory
          ? {
              ...cat,
              subcategories: [
                ...cat.subcategories,
                { name: subcategoryName, description: subcategoryDescription },
              ],
            }
          : cat
      )
    )
    setSubcategoryName("")
    setSubcategoryDescription("")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Add categories and subcategories with descriptions to organize your LMS content.
        </p>
      </div>

      {/* Side by Side Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Category */}
        <Card>
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
            <CardDescription>Create a new course category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Input
              placeholder="Enter category description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
            />
            <Button onClick={handleAddCategory} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Add Subcategory */}
        <Card>
          <CardHeader>
            <CardTitle>Add Subcategory</CardTitle>
            <CardDescription>
              Select a category and add its subcategories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={selectedCategory ?? ""}
              onChange={(e) =>
                setSelectedCategory(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Enter subcategory name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
            <Input
              placeholder="Enter subcategory description"
              value={subcategoryDescription}
              onChange={(e) => setSubcategoryDescription(e.target.value)}
            />
            <Button
              onClick={handleAddSubcategory}
              disabled={!selectedCategory}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Subcategory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Subcategories</CardTitle>
          <CardDescription>
            All created categories with subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories added yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Folder className="h-4 w-4 text-primary" />
                    {cat.name}
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>

                  {cat.subcategories.length > 0 ? (
                    <ul className="ml-6 mt-2 list-disc text-sm text-muted-foreground space-y-1">
                      {cat.subcategories.map((sub, idx) => (
                        <li key={idx}>
                          <div className="flex items-center gap-2 font-medium">
                            <FolderTree className="h-3 w-3 text-muted-foreground" />
                            {sub.name}
                          </div>
                          <p className="ml-5 text-xs text-muted-foreground">{sub.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-6 text-xs text-muted-foreground">No subcategories</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
