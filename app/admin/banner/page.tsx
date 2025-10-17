"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Trash2 } from "lucide-react"
import { saveBanner, deleteBanner, fetchBanners } from "@/lib/function"
import { BannerItem } from "@/types"

function BannerForm({
  title,
  description,
  value,
  banners,
  setBanners,
  placeholder,
}: {
  title: string
  description: string
  value: "website" | "app1" | "app2"
  banners: BannerItem[]
  setBanners: (items: BannerItem[]) => void
  placeholder: string
}) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleDelete = async (bannerId: string | undefined) => {
    if (!bannerId) return
    setIsLoading(true)
    try {
      const res = await deleteBanner(value, bannerId)
      if (res) {
        setBanners(banners.filter((b) => b._id !== bannerId))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    try {
      const res = await saveBanner({ type: value, file, url })
      if (res && res.banner) {
        const latest = res.banner.banners[res.banner.banners.length - 1]
        setBanners([...banners, latest])
        setFile(null)
        setUrl("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="space-y-2">
            <Label>Banner Link (Optional)</Label>
            <Input
              type="url"
              placeholder={placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={!file || isLoading}>
            {isLoading ? "Saving..." : <><Upload className="h-4 w-4 mr-2" /> Save Banner</>}
          </Button>
        </form>

        {/* Render all uploaded banners */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b._id || b.image} className="relative group border rounded-md overflow-hidden">
              <img src={b.image} alt="banner" className="w-full h-32 object-cover" />
              {b.url && (
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded"
                >
                  {b.url}
                </a>
              )}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                onClick={() => handleDelete(b._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function BannerPage() {
  const [website, setWebsite] = useState<BannerItem[]>([])
  const [app1, setApp1] = useState<BannerItem[]>([])
  const [app2, setApp2] = useState<BannerItem[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetchBanners()
      if (res && res.banners) {
        res.banners.forEach((b: any) => {
          if (b.type === "website") setWebsite(b.banners)
          if (b.type === "app1") setApp1(b.banners)
          if (b.type === "app2") setApp2(b.banners)
        })
      }
    }
    load()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>
      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="app1">App 1</TabsTrigger>
          <TabsTrigger value="app2">App 2</TabsTrigger>
        </TabsList>

        <TabsContent value="website">
          <BannerForm
            title="Website Banner"
            description="Upload multiple banners for website"
            value="website"
            banners={website}
            setBanners={setWebsite}
            placeholder="https://example.com"
          />
        </TabsContent>

        <TabsContent value="app1">
          <BannerForm
            title="App 1 Banner"
            description="Upload multiple banners for App 1"
            value="app1"
            banners={app1}
            setBanners={setApp1}
            placeholder="app1://promo"
          />
        </TabsContent>

        <TabsContent value="app2">
          <BannerForm
            title="App 2 Banner"
            description="Upload multiple banners for App 2"
            value="app2"
            banners={app2}
            setBanners={setApp2}
            placeholder="app2://promo"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
