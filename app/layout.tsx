import "./globals.css";
import QueryProvider from "../providers/query-provider";
import { ThemeProvider } from "../providers/theme-provider";
import { Toaster } from "sonner";

export const metadata = {
  title: "PeopleCore EMS",
  description: "Modern employee operations, attendance, leave and payroll management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
