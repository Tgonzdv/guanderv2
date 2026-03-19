import { queryD1, CloudflareD1Error } from "@/lib/cloudflare-d1";

interface Store {
  id_store: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image_url: string | null;
  category_id: number | null;
  [key: string]: unknown;
}

const CATEGORY_LABELS: Record<number, string> = {
  1: "Veterinaria",
  2: "Pet Shop",
  3: "Cafetería",
  4: "Restaurante",
  5: "Grooming",
  6: "Resort",
};

function StoreCard({ store }: { store: Store }) {
  const initials = store.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const categoryLabel =
    store.category_id != null
      ? (CATEGORY_LABELS[store.category_id] ?? `Cat. ${store.category_id}`)
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image / Avatar */}
      <div
        className="h-36 flex items-center justify-center text-4xl font-black text-white"
        style={{
          background:
            "linear-gradient(135deg, #3D52D5 0%, #43D8B0 100%)",
        }}
      >
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.image_url}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug">
            {store.name}
          </h3>
          {categoryLabel && (
            <span
              className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#E8F9F3", color: "#1A9E6A" }}
            >
              {categoryLabel}
            </span>
          )}
        </div>

        {store.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {store.description}
          </p>
        )}

        <div className="mt-auto pt-3 flex flex-col gap-1.5 text-xs text-gray-400">
          {store.city && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {[store.address, store.city].filter(Boolean).join(", ")}
            </span>
          )}
          {store.phone && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {store.phone}
            </span>
          )}
          {store.email && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {store.email}
            </span>
          )}
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#43D696] transition-colors"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
              Ver sitio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function StoresList() {
  let stores: Store[] = [];
  let error: string | null = null;

  try {
    stores = await queryD1<Store>("SELECT * FROM stores ORDER BY id_store ASC");
  } catch (e) {
    if (e instanceof CloudflareD1Error) {
      error = e.message;
    } else {
      error = "Error inesperado al cargar las tiendas.";
    }
  }

  return (
    <section id="tiendas" className="w-full bg-gray-50 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <h2 className="text-3xl font-black text-gray-900">
            Tiendas Petfriendly
          </h2>
          <p className="text-gray-500 text-sm max-w-md">
            Descubre comercios que reciben a tu mascota con los brazos abiertos.
          </p>
          <button
            className="mt-1 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ background: "#4F5BD5" }}
          >
            Todas
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-300 bg-red-50 text-red-600 rounded-xl p-4 text-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Grid */}
        {stores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id_store} store={store} />
            ))}
          </div>
        )}

        {!error && stores.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">
            No hay tiendas registradas aún.
          </p>
        )}
      </div>
    </section>
  );
}
