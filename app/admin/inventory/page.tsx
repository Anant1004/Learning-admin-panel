"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Folder, Trash2 } from "lucide-react";
import {
  fetchCategories,
  handleFetchCategoriesAndSubcategories,
  handleAddCategory,
  handleAddSubcategory as addSubcategory,
  handleDeleteCategory as deleteCategory,
  handleDeleteSubcategory as deleteSubcategory,
} from "@/lib/function";
import { Category } from "@/types";

export default function CategoryPage() {
  const categorySectionRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPendingSub, startTransitionSub] = useTransition();

  useEffect(() => {
    const loadCategories = async () => {
      const [cats, catsWithSubs] = await Promise.all([
        fetchCategories(),
        handleFetchCategoriesAndSubcategories(),
      ]);

      if (cats) {
        const merged = cats.map((cat: any) => {
          const match = catsWithSubs?.find((c: any) => c._id === cat._id);
          return {
            ...cat,
            subcategories: match?.subcategories || [],
          };
        });
        setCategories(merged);
      }
    };
    loadCategories();
  }, [isPending, isPendingSub]);

  const onAddCategory = () => {
    if (!categoryName.trim()) return;
    startTransition(async () => {
      await handleAddCategory(categoryName, categoryDescription);
      setCategoryName("");
      setCategoryDescription("");

      const [cats, catsWithSubs] = await Promise.all([
        fetchCategories(),
        handleFetchCategoriesAndSubcategories(),
      ]);

      if (cats) {
        const merged = cats.map((cat: any) => {
          const match = catsWithSubs?.find((c: any) => c._id === cat._id);
          return {
            ...cat,
            subcategories: match?.subcategories || [],
          };
        });
        setCategories(merged);
      }
    });
  };

  const handleAddSubcategory = async () => {
    if (!subcategoryName.trim() || !selectedCategory) return;

    startTransitionSub(async () => {
      const response = await addSubcategory(
        subcategoryName,
        subcategoryDescription,
        selectedCategory
      );

      if (response?.ok) {
        setSubcategoryName("");
        setSelectedCategory(null);
        setSubcategoryDescription("");
        scrollToCategories();

        const [cats, catsWithSubs] = await Promise.all([
          fetchCategories(),
          handleFetchCategoriesAndSubcategories(),
        ]);

        if (cats) {
          const merged = cats.map((cat: any) => {
            const match = catsWithSubs?.find((c: any) => c._id === cat._id);
            return {
              ...cat,
              subcategories: match?.subcategories || [],
            };
          });
          setCategories(merged);
        }
      }
    });
  };

  const scrollToCategories = () => {
    categorySectionRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!categoryId) return;

    const response = await deleteCategory(categoryId);
    if (response?.ok) {
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!subcategoryId) return;

    const response = await deleteSubcategory(subcategoryId);
    if (response?.ok) {
      const [cats, catsWithSubs] = await Promise.all([
        fetchCategories(),
        handleFetchCategoriesAndSubcategories(),
      ]);

      if (cats) {
        const merged = cats.map((cat: any) => {
          const match = catsWithSubs?.find((c: any) => c._id === cat._id);
          return {
            ...cat,
            subcategories: match?.subcategories || [],
          };
        });
        setCategories(merged);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Add categories and subcategories with descriptions to organize your
          LMS content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
            <Button onClick={onAddCategory} className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Adding..." : "Add Category"}
            </Button>
          </CardContent>
        </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>
            <div ref={categorySectionRef}></div>
            Categories & Subcategories
          </CardTitle>
          <CardDescription>
            All created categories (with or without subcategories)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No categories added yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((cat) => (
                <div key={cat._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Folder className="h-4 w-4 text-primary" />
                      {cat.name}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-50 hover:opacity-100 transition"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>

                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    <ul className="ml-6 mt-2 list-disc text-sm text-muted-foreground space-y-1">
                      {cat.subcategories.map((sub: any) => (
                        <li key={sub._id || sub.name}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                              {sub.name}
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="opacity-50 hover:opacity-100 transition"
                              onClick={() => handleDeleteSubcategory(sub._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="ml-5 text-xs text-muted-foreground">
                            {sub.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-6 text-xs text-muted-foreground">
                      No subcategories
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
