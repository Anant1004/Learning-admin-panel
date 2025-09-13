"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Calendar,
  UserPlus,
  BookOpen,
  UsersIcon,
  Star,
  Upload,
  PlusCircle,
  Loader2,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import toast from "react-hot-toast"
import { Adduser, getRoleColor } from "@/lib/function"
import { EnhancedUser } from "@/types"


export default function UsersPage() {
  const [users, setUsers] = useState<EnhancedUser[]>()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [picture, setPicture] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [file, setFile] = useState<File | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [adminsCount, setAdminsCount] = useState(0)
  const [instructorsCount, setInstructorsCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phoneNo: "",
    password: "",
    role: "student" as "admin" | "instructor" | "student",
    bio: "",
    expertise: "",
    profile_image: file,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPicture(URL.createObjectURL(selectedFile));
    }
  };


  useEffect(() => {
    handleFetchUsers();
  }, []);

  const handleFetchUsers = async () => {
    try {
      const res = await apiClient("GET", "/users", null, false);

      if (res?.ok && Array.isArray(res.users)) {
        const mappedUsers: EnhancedUser[] = res.users?.map((u: any) => ({
          _id: u._id,
          fullname: u.fullname,
          email: u.email,
          phoneNo: u.phoneNo || "",
          role: u.role,
          bio: u.bio || "",
          expertise: u.expertise ? u.expertise.split(",").map((s: string) => s.trim()) : [],
          profile_image: u.profile_image || "",
          created_at: u.created_at,
          updatedAt: u.updatedAt,
        }));
        setTotalUsers(res.stats.totalUsers || 0);
        setStudentsCount(res.stats.totalStudents || 0);
        setAdminsCount(res.stats.totalAdmins || 0);
        setInstructorsCount(res.stats.totalInstructors || 0);

        setUsers(mappedUsers);
        console.log("Fetched users:", mappedUsers);
      } else {
        toast.error(res?.message || "Failed to fetch users");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };


  const handleAddUser = async () => {
    const formData = new FormData();
  
    formData.append("fullname", newUser.fullname);
    formData.append("email", newUser.email);
    formData.append("phoneNo", newUser.phoneNo || "");
    formData.append("password", newUser.password);
    formData.append("role", newUser.role);
  
    if (newUser.bio) formData.append("bio", newUser.bio);
    if (newUser.expertise) formData.append("expertise", newUser.expertise);
  
    if (file) {
      formData.append("profile_image", file);
    }
  
    await Adduser(formData);
  
    setIsAddingUser(false);
    setNewUser({
      fullname: "",
      email: "",
      phoneNo: "",
      password: "",
      role: "student",
      bio: "",
      expertise: "",
      profile_image: file,
    });
    setPicture("");
    setFile(null);
  };



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Users</h1>
          <p className="text-muted-foreground">Manage all user accounts, roles, and permissions</p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with role and details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  placeholder="Enter full name"
                  value={newUser.fullname}
                  onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phoneNo">Phone Number</Label>
                <Input
                  id="user-phoneNo"
                  type="tel"
                  placeholder="Enter phoneNo number"
                  value={newUser.phoneNo}
                  onChange={(e) => setNewUser({ ...newUser, phoneNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-photo">Profile Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="user-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => document.getElementById("user-photo")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
                {picture && (
                  <div className="mt-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={picture} alt="Preview" />
                      <AvatarFallback>{newUser.fullname?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Optional: Upload a profile picture</p>
              </div>

              {newUser.role === "instructor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="user-bio">Bio</Label>
                    <Textarea
                      id="user-bio"
                      placeholder="Brief description of the instructor"
                      value={newUser.bio}
                      onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-expertise">Expertise</Label>
                    <Input
                      id="user-expertise"
                      placeholder="React, JavaScript, Node.js (comma separated)"
                      value={newUser.expertise}
                      onChange={(e) => setNewUser({ ...newUser, expertise: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 ">
                <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Students</span>
            </div>
            <div className="text-2xl font-bold">{studentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Instructors</span>
            </div>
            <div className="text-2xl font-bold">{instructorsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Admins</span>
            </div>
            <div className="text-2xl font-bold">{adminsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users?.map((user) => (
          <Card key={user._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.fullname} />
                    <AvatarFallback>{user.fullname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{user.fullname}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {user.role === "instructor" && user.bio && (
                      <p className="text-sm text-muted-foreground max-w-5xl">{user.bio}</p>
                    )}

                    {user.expertise && user.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.expertise.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {user.created_at}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        {user.role !== "admin" && (
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
         
      </div>

      {/* {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
          <p className="text-muted-foreground">
            {searchTerm || roleFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first user"}
          </p>
        </div>
      )} */}
    </div>
  )
}
