import toast from "react-hot-toast";
import { apiClient } from "./api";

export const fetchCategories = async () => {
    try {
      const res = await apiClient("GET", "/categories");
      if (res.ok) {
        return res.data;
      } else {
        console.error("Failed to fetch categories");
        return null;
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      return null;
    }
};
  
export const fetchSubcategories = async (id: string) => {
try {
    const res = await apiClient("GET", `/subcategories/${id}`);
    if (res.ok) {
    return res.data;
    } else {
    console.error("Failed to fetch subcategories");
    return null;
    }
} catch (err) {
    console.error("Error fetching subcategories:", err);
    return null;
}
};

export const handleFetchCategoriesAndSubcategories = async () => {
    try {
      const res = await apiClient("GET", "/categories/with-subcategories");
      return res?.categories || [];
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
};

export const handleAddCategory = async (categoryName: string, categoryDescription: string) => {
    if (!categoryName.trim()) return;

    try {
        const newCategory = await apiClient("POST", "/categories", {
          name: categoryName,
          description: categoryDescription,
        });

        if (newCategory.ok) {
          toast.success(newCategory.message);
          return newCategory;
        } else {
          toast.error(newCategory.error);
          return null;
        }
      } catch (err) {
        console.error("Failed to add category:", err);
        return null;
      }
};

export const handleAddSubcategory = async (subcategoryName: string, subcategoryDescription: string, categoryId: string) => {
  if (!subcategoryName.trim() || !categoryId) return null;

  try {
    const response = await apiClient("POST", "/subcategories", {
      name: subcategoryName,
      description: subcategoryDescription,
      categoryId,
    });

    if (response.ok) {
      toast.success(response.message || 'Subcategory added successfully');
      return response;
    } else {
      toast.error(response.error || 'Failed to add subcategory');
      return null;
    }
  } catch (err) {
    console.error("Failed to add subcategory:", err);
    toast.error("Failed to add subcategory");
    return null;
  }
};

export const handleDeleteCategory = async (categoryId: number) => {
  if (!categoryId) return null;

  try {
    const response = await apiClient("DELETE", `/categories/${categoryId}`);
    
    if (response.ok) {
      toast.success(response.message || 'Category deleted successfully');
      return response;
    } else {
      toast.error(response.error || 'Failed to delete category');
      return null;
    }
  } catch (err) {
    console.error("Failed to delete category:", err);
    toast.error("Failed to delete category");
    return null;
  }
};

export const handleDeleteSubcategory = async (subcategoryId: number) => {
  if (!subcategoryId) return null;

  try {
    const response = await apiClient("DELETE", `/subcategories/${subcategoryId}`);
    
    if (response.ok) {
      toast.success(response.message || 'Subcategory deleted successfully');
      return response;
    } else {
      toast.error(response.error || 'Failed to delete subcategory');
      return null;
    }
  } catch (err) {
    console.error("Failed to delete subcategory:", err);
    toast.error("Failed to delete subcategory");
    return null;
  }
};