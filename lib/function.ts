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

export const handleAddCourse = async (formData: any) => {
  console.log("course Form Data to send:", formData);
    try {
        const newCourse = await apiClient("POST", "/course", formData);

        if (newCourse.ok) {
          toast.success(newCourse.message);
          return newCourse;
        } else {
          toast.error(newCourse.error);
          return null;
        }
      } catch (err) {
        console.error("Failed to add course:", err);
        return null;
      }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "instructor":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "student":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export const Adduser = async (formData: FormData) => {
  const fullname = formData.get("fullname")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const role = formData.get("role")?.toString().trim();

  if (!fullname) return toast.error("Full name is required");
  if (!email) return toast.error("Email is required");
  if (!password) return toast.error("Password is required");
  if (!role) return toast.error("Role is required");

  // Optional fields
  const phoneNo = formData.get("phoneNo")?.toString().trim() || "";
  const bio = formData.get("bio")?.toString().trim() || "";
  const expertise = formData.get("expertise")?.toString().trim() || "";

  try {
      const newUser = await apiClient("POST", "/users", formData, true);
      if (newUser.ok) {
        toast.success(newUser.message);
        return newUser;
      } else {
        toast.error(newUser.error || "Failed to add user");
        return null;
      }
  } catch (err) {
      console.error("Failed to add user:", err);
      toast.error("Something went wrong");
      return null;
  }
};

export const FetchInstructors = async () => {
  try {
    const res = await apiClient("GET", "/users");
    if (res.ok) {
      const filteredUsers = res.users.filter((user: any) => user.role === "instructor");
      return filteredUsers;
    } else {
      console.error("Failed to fetch instructors");
      return null;
    }
  } catch (err) {
    console.error("Error fetching instructors:", err);
    return null;
  }
};

export const FetchCourses = async () => {
  try {
    const res = await apiClient("GET", "/course");
    if (res.ok) {
      return res;
    } else {
      console.error("Failed to fetch courses");
      return null;
    }
  } catch (err) {
    console.error("Error fetching courses:", err);
    return null;
  }
};

export const uploadPDFfile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient("POST", "/testSeries/uploadPDFfile", formData, true);
    if (res.ok) {
      return res;
    } else {
      console.error("Failed to upload file");
      return null;
    }
  } catch (err) {
    console.error("Error uploading file:", err);
    return null;
  }
};

export const uploadTestSeries = async (formData: FormData) => {
  try {
    const res = await apiClient("POST", "/testSeries", formData);
    if (res.ok) {
      toast.success(res.message);
      return res;
    } else {
      toast.error(res.error || "Failed to add test series");
      return null;
    }
  } catch (err) {
    console.error("Failed to add test series:", err);
    toast.error("Something went wrong");
    return null;
  }
};