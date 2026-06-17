import { UploadCloud, Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import { galleryItems, galleryCategories, categoryHue } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader, Panel } from "@/components/admin/AdminUI";
import { TintGlass } from "@/components/ui/TintGlass";

export default function AdminGalleryPage() {
  return (
    <>
      <AdminPageHeader
        title="Gallery"
        subtitle="Upload project photos and organize them by category."
        actions={
          <Button size="sm">
            <ImagePlus className="h-4 w-4" />
            Upload Images
          </Button>
        }
      />

      {/* Upload dropzone */}
      <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <UploadCloud className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-base font-semibold text-white">
          Drag &amp; drop images here
        </p>
        <p className="mt-1 text-sm text-mist">
          or click to browse — JPG, PNG up to 10MB each
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          Choose files
        </Button>
      </div>

      {/* Categories */}
      <Panel title="Categories" className="mb-6">
        <div className="flex flex-wrap items-center gap-2 p-5">
          {galleryCategories.map((c) => (
            <span
              key={c}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-charcoal-light py-1.5 pl-3.5 pr-2 text-sm text-snow/85"
            >
              {c}
              <span className="text-xs text-mist">
                {galleryItems.filter((g) => g.category === c).length}
              </span>
              <button
                type="button"
                title="Edit category"
                className="grid h-6 w-6 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-gold"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 py-1.5 text-sm text-mist hover:border-gold/40 hover:text-gold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add category
          </button>
        </div>
      </Panel>

      {/* Image grid */}
      <Panel title={`Images (${galleryItems.length})`}>
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="group relative">
              <TintGlass
                hue={categoryHue[item.category]}
                className="aspect-square"
                badge={item.tint}
              />
              <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-black/55 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    title="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-ink/80 text-snow hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-ink/80 text-snow hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="truncate text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gold">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
