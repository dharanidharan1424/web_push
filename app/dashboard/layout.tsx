import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar userName={session?.user?.name || undefined} userEmail={session?.user?.email || undefined} />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
