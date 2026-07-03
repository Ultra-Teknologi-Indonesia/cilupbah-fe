const fs = require('fs');

let file = 'src/app/dashboard/kontak-pelanggan/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const importTabs = `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";\n`;
if (!c.includes('@/components/ui/tabs')) {
    c = c.replace('import { useUrlTab } from "@/hooks/use-url-tab";', `import { useUrlTab } from "@/hooks/use-url-tab";\n${importTabs}`);
}

const tabsRegex = /<div className="flex items-center gap-1">[\s\S]*?<\/div>\s*\{activeTab === "pelanggan" && <PelangganTab \/>\}\s*\{activeTab === "salesman" && <SalesmanTab \/>\}\s*\{activeTab === "kategori" && <KategoriTab \/>\}/m;

const replacement = `<Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)} className="flex flex-col gap-6">
      <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger
            key={key}
            value={key}
            className="inline-flex h-auto items-center gap-1.5 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:bg-foreground! data-[state=active]:text-background! data-[state=active]:shadow-sm! after:hidden!"
          >
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="pelanggan" className="mt-0 outline-none">
        <PelangganTab />
      </TabsContent>
      <TabsContent value="salesman" className="mt-0 outline-none">
        <SalesmanTab />
      </TabsContent>
      <TabsContent value="kategori" className="mt-0 outline-none">
        <KategoriTab />
      </TabsContent>
    </Tabs>`;

c = c.replace(tabsRegex, replacement);

// Since we wrapped it in <Tabs className="flex flex-col gap-6">, we should remove the gap-6 from the parent if possible, but let's just make Tabs NOT have flex-col gap-6, and keep the parent.
const replacement2 = `<Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)}>
      <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger
            key={key}
            value={key}
            className="inline-flex h-auto items-center gap-1.5 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:bg-foreground! data-[state=active]:text-background! data-[state=active]:shadow-sm! after:hidden!"
          >
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        <TabsContent value="pelanggan" className="mt-0 outline-none">
          <PelangganTab />
        </TabsContent>
        <TabsContent value="salesman" className="mt-0 outline-none">
          <SalesmanTab />
        </TabsContent>
        <TabsContent value="kategori" className="mt-0 outline-none">
          <KategoriTab />
        </TabsContent>
      </div>
    </Tabs>`;
    
c = c.replace(replacement, replacement2); // in case we want this structure

fs.writeFileSync(file, c);
console.log("Updated", file);
