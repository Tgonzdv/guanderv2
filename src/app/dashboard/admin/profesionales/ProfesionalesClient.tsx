"use client";

import { useState, useMemo } from "react";
import { Search, Star, MapPin, Briefcase, X, CheckCircle, XCircle } from "lucide-react";

export interface ProfessionalItem {
  id: number;
  name: string;
  email: string;
  serviceType: string;
  description: string;
  address: string;
  location: string;
  stars: number | null;
  acceptsPoints: boolean;
}

const PLACEHOLDER_AVATARS = [
  "https://placehold.co/400x200/1f4b3b/ffffff?text=Profesional",
  "https://placehold.co/400x200/3d6b4f/ffffff?text=Profesional",
  "https://placehold.co/400x200/7d8b6a/ffffff?text=Profesional",
  "https://placehold.co/400x200/3d6b6b/ffffff?text=Profesional",
  "https://placehold.co/400x200/173a2d/ffffff?text=Profesional",
  "https://placehold.co/400x200/5a7a5a/ffffff?text=Profesional",
];

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: "var(--guander-muted)" }} className="text-sm">Sin calificación</span>;
  return (
    <span className="flex items-center gap-1">
      <Star size={14} className="fill-amber-400 text-amber-400" />
      <span className="text-sm font-bold" style={{ color: "var(--guander-ink)" }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}

export default function ProfesionalesClient({
  initialProfessionals,
}: {
  initialProfessionals: ProfessionalItem[];
}) {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("Todos");
  const [viewProfessional, setViewProfessional] = useState<ProfessionalItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const serviceTypes = useMemo(() => {
    const types = Array.from(new Set(initialProfessionals.map((p) => p.serviceType)));
    return ["Todos", ...types];
  }, [initialProfessionals]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return initialProfessionals.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.serviceType.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      const matchesService = serviceFilter === "Todos" || p.serviceType === serviceFilter;
      return matchesSearch && matchesService;
    });
  }, [initialProfessionals, search, serviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  function handleSearch(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  function handleServiceFilter(val: string) {
    setServiceFilter(val);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--guander-ink)" }}>
            Gestión de Profesionales
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--guander-muted)" }}>
            {filtered.length} profesional{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search & filters */}
      <div
        className="bg-white rounded-2xl p-4 space-y-3"
        style={{ border: "1px solid var(--guander-border)" }}
      >
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--guander-muted)" }}
          />
          <input
            type="text"
            placeholder="Buscar profesional..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              border: "1px solid var(--guander-border)",
              backgroundColor: "var(--guander-cream)",
              color: "var(--guander-ink)",
            }}
          />
        </div>

        {/* Service type chips */}
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleServiceFilter(type)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer"
              style={
                serviceFilter === type
                  ? { backgroundColor: "var(--guander-forest)", color: "#fff" }
                  : {
                      backgroundColor: "var(--guander-mint)",
                      color: "var(--guander-ink)",
                      border: "1px solid var(--guander-border)",
                    }
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {paginated.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-10 text-center"
          style={{ border: "1px solid var(--guander-border)" }}
        >
          <p style={{ color: "var(--guander-muted)" }}>
            No se encontraron profesionales con esos filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {paginated.map((prof, i) => (
            <div
              key={prof.id}
              className="bg-white rounded-2xl overflow-hidden flex flex-col"
              style={{ border: "1px solid var(--guander-border)" }}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={PLACEHOLDER_AVATARS[i % PLACEHOLDER_AVATARS.length]}
                  alt={prof.name}
                  className="w-full h-40 object-cover"
                />
                <span
                  className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#3d6b6b", color: "#ffffff" }}
                >
                  PROFESIONAL
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <p className="font-bold text-base leading-tight" style={{ color: "var(--guander-ink)" }}>
                  {prof.name}
                </p>
                <p className="text-xs" style={{ color: "var(--guander-muted)" }}>
                  {prof.email}
                </p>
                <p className="text-sm font-medium" style={{ color: "#3d6b6b" }}>
                  {prof.serviceType}
                </p>

                <div className="flex items-center gap-3 mt-1">
                  <StarRating value={prof.stars} />
                  {prof.acceptsPoints ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#1f7a4a" }}>
                      <CheckCircle size={12} /> Acepta puntos
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--guander-muted)" }}>
                      <XCircle size={12} /> Sin puntos
                    </span>
                  )}
                </div>

                {prof.address && (
                  <div className="flex items-start gap-1 mt-0.5">
                    <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: "var(--guander-muted)" }} />
                    <p className="text-xs leading-tight" style={{ color: "var(--guander-muted)" }}>
                      {prof.address}
                    </p>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={() => setViewProfessional(prof)}
                  className="mt-auto pt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "#c5cdb3", color: "#3d4f35" }}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between bg-white rounded-2xl px-5 py-3"
          style={{ border: "1px solid var(--guander-border)" }}
        >
          <span className="text-sm" style={{ color: "var(--guander-muted)" }}>
            Página {safePage} de {totalPages} ({filtered.length} profesionales)
          </span>
          <div className="flex gap-2">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer hover:opacity-90 disabled:opacity-40"
              style={{
                border: "1px solid var(--guander-border)",
                backgroundColor: "var(--guander-cream)",
                color: "var(--guander-ink)",
              }}
            >
              Anterior
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition cursor-pointer hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--guander-forest)" }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* View modal */}
      <Modal open={!!viewProfessional} onClose={() => setViewProfessional(null)}>
        {viewProfessional && (
          <>
            <div className="p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={18} style={{ color: "var(--guander-forest)" }} />
                <h2 className="text-lg font-bold" style={{ color: "var(--guander-ink)" }}>
                  {viewProfessional.name}
                </h2>
              </div>
              <button
                onClick={() => setViewProfessional(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              {/* Tags row */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#d6ede0", color: "#1f4b3b" }}
                >
                  {viewProfessional.serviceType}
                </span>
                {viewProfessional.acceptsPoints && (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: "#d6ede0", color: "#1f4b3b" }}
                  >
                    <CheckCircle size={11} /> Acepta puntos
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--guander-muted)" }}>
                  Email
                </p>
                <p className="text-sm" style={{ color: "var(--guander-ink)" }}>
                  {viewProfessional.email || "—"}
                </p>
              </div>

              {/* Rating */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--guander-muted)" }}>
                  Valoración
                </p>
                <StarRating value={viewProfessional.stars} />
              </div>

              {/* Address */}
              {viewProfessional.address && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--guander-muted)" }}>
                    Dirección
                  </p>
                  <p className="text-sm" style={{ color: "var(--guander-ink)" }}>
                    {viewProfessional.address}
                  </p>
                </div>
              )}

              {/* Description */}
              {viewProfessional.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--guander-muted)" }}>
                    Descripción
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--guander-ink)" }}>
                    {viewProfessional.description}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
