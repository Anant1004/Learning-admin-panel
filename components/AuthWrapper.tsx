"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname === "/") {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        } else {
            setLoading(false);
        }
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
