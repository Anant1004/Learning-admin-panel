"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, FolderTree, Folder, Pencil, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api" // 🔹 import your axios client
import { toast } from 'react-hot-toast';
interface Subcategory {
  _id?: number
  name: string
  description: string
}

interface Category {
  _id: number
  name: string
  description: string
  subcategories: Subcategory[]
}

export default function CategoryPage() {
  const categoryAndSubcategorySectionRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [subcategoryName, setSubcategoryName] = useState("")
  const [subcategoryDescription, setSubcategoryDescription] = useState<any>("")
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition();
  const [isPendingSub, startTransitionSub] = useTransition();
  const [categoryandsubcategory, setCategoryAndSubcategory] = useState<[]>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient("GET", "/categories")
        setCategories(res.data || [])
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;

    startTransition(async () => {
      try {
        const newCategory = await apiClient("POST", "/categories", {
          name: categoryName,
          description: categoryDescription,
        });

        if (newCategory.ok) {
          setCategories((prev) => [...prev, newCategory.category]);
          setCategoryName("");
          setCategoryDescription("");
          toast.success(newCategory.message);
        } else {
          toast.error(newCategory.error);
        }
      } catch (err) {
        console.error("Failed to add category:", err);
      }
    });
  };
  const handleAddSubcategory = () => {
    if (!subcategoryName.trim() || selectedCategory === null) return;

    startTransitionSub(async () => {
      try {
        const newSub = await apiClient("POST", `/subcategories`, {
          name: subcategoryName,
          description: subcategoryDescription,
          categoryId: selectedCategory,
        });

        if (newSub.ok) {
          toast.success(newSub.message);
          setSubcategoryName("");
          setSelectedCategory(null);
          setSubcategoryDescription("");
          scrollToCategoryAndSubcategory();
        } else {
          toast.error(newSub.error);
        }
      } catch (err) {
        console.error("Failed to add subcategory:", err);
      }
    });
  };


  const scrollToCategoryAndSubcategory = () => {
    categoryAndSubcategorySectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFetchCategoriesAndSubcategories = async () => {
    try {
      const res = await apiClient("GET", "/categories/with-subcategories");
      setCategoryAndSubcategory(res?.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    handleFetchCategoriesAndSubcategories();
  }, [isPendingSub]);

  const handleDeleteCategory = async (categoryId: number) => {
    if (!categoryId) return;
    
    try {
      const res = await apiClient("DELETE", `/categories/${categoryId}`);
      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        toast.success(res.message);
        handleFetchCategoriesAndSubcategories();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!subcategoryId) return;

    try {
      const res = await apiClient("DELETE", `/subcategories/${subcategoryId}`);
      if (res.ok) {
        toast.success(res.message);
        handleFetchCategoriesAndSubcategories();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
    }
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
            <Button onClick={handleAddCategory} className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Adding..." : "Add Category"}
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
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
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
              disabled={!selectedCategory || isPendingSub}
              className="w-full"
            >
              {isPendingSub ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              {isPendingSub ? "Adding..." : "Add Subcategory"}
            </Button>

          </CardContent>
        </Card>
      </div>

      {/* Category List */}
      <Card>
        <CardHeader>
          <CardTitle><div ref={categoryAndSubcategorySectionRef}></div>Categories & Subcategories</CardTitle>
          <CardDescription>
            All created categories with subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories added yet.</p>
          ) : (

            <div className="grid gap-4 md:grid-cols-2">
              {categoryandsubcategory?.map((cat: any) => (
                <div key={cat?._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Folder className="h-4 w-4 text-primary" />
                      {cat?.name}
                    </div>

                    {/* Category Actions */}
                    <div className="flex gap-2">
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button> */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="opacity-50 hover:opacity-100 transition"
                        onClick={() => handleDeleteCategory(cat._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{cat?.description}</p>

                  {cat?.subcategories?.length > 0 ? (
                    <ul className="ml-6 mt-2 list-disc text-sm text-muted-foreground space-y-1">
                      {cat?.subcategories?.map((sub: any) => (
                        <li key={sub?._id || sub?.name}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                              {/* <FolderTree className="h-3 w-3 text-muted-foreground" /> */}
                              {sub?.name}
                            </div>

                            {/* Subcategory Actions */}
                            <div className="flex gap-2">
                              {/* <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSubcategory(sub)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button> */}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="opacity-50 hover:opacity-100 transition"
                                onClick={() => handleDeleteSubcategory(sub._id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="ml-5 text-xs text-muted-foreground">
                            {sub?.description}
                          </p>
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
