"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import L from "leaflet";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const CATEGORY_GRADIENTS: Record<string, { from: string; to: string }> = {
  Veterinaria: { from: "#3D52D5", to: "#4A9FD4" },
  "Pet Shop": { from: "#1d7a4f", to: "#43D696" },
  "Cafetería": { from: "#b45309", to: "#f59e0b" },
  Restaurante: { from: "#be185d", to: "#f472b6" },
  Grooming: { from: "#7c3aed", to: "#a78bfa" },
  Resort: { from: "#0f766e", to: "#34d399" },
};

export interface LocationItem {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  address: string | null;
  location: string | null;
  image: string | null;
}

interface LocationsFilterClientProps {
  locations: LocationItem[];
}

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

type MarkerPoint = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  addressLabel: string;
};

const guanderIcon = L.icon({
  iconUrl: "/guander-marker.svg",
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -42],
});

function parseLatLng(raw: string | null): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(",").map((value) => Number(value.trim()));
  if (parts.length !== 2) return null;
  const [lat, lng] = parts;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const first = data[0];
  if (!first?.lat || !first?.lon) return null;

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

function StoresMap({ locations }: { locations: LocationItem[] }) {
  const [points, setPoints] = useState<MarkerPoint[]>([]);
  const [resolving, setResolving] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolvePoints() {
      setResolving(true);
      const collected: MarkerPoint[] = [];

      for (const item of locations) {
        const direct = parseLatLng(item.location);
        if (direct) {
          collected.push({
            id: item.id,
            name: item.name,
            lat: direct.lat,
            lng: direct.lng,
            description: item.description,
            addressLabel: item.address ?? item.city,
          });
          continue;
        }

        const queryAddress = item.address ?? item.city;
        if (!queryAddress) continue;

        const resolved = await geocodeAddress(queryAddress);
        if (!resolved) continue;

        collected.push({
          id: item.id,
          name: item.name,
          lat: resolved.lat,
          lng: resolved.lng,
          description: item.description,
          addressLabel: queryAddress,
        });
      }

      if (!cancelled) {
        setPoints(collected);
        setResolving(false);
      }
    }

    void resolvePoints();

    return () => {
      cancelled = true;
    };
  }, [locations]);

  useEffect(() => {
    if (!mapContainerRef.current || points.length === 0) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [-34.6037, -58.3816],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    points.forEach((point) => {
      const marker = L.marker([point.lat, point.lng], { icon: guanderIcon });
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
      marker.bindPopup(
        `<div style="min-width:190px;max-width:260px;">
          <div style="font-weight:800;color:#173a2d;">${point.name}</div>
          <div style="font-size:12px;color:#35584a;margin-top:4px;">${point.addressLabel}</div>
          <div style="font-size:12px;margin-top:6px;">${point.description}</div>
          <a
            href="${directionsUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-block;margin-top:10px;padding:8px 10px;border-radius:10px;background:#173a2d;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;"
          >
            Como llegar
          </a>
        </div>`,
      );
      marker.addTo(map);
      bounds.extend([point.lat, point.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28] });
    }

    // Force recalculation after layout settles to avoid partially rendered tiles.
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 120);
  }, [points]);

  useEffect(() => {
    const container = mapContainerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [points.length]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (resolving) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress size={26} />
          <Typography variant="body2" sx={{ mt: 1.2 }}>
            Cargando mapa de locales...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (points.length === 0) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        No se encontraron coordenadas válidas para mostrar los locales en el mapa.
      </Alert>
    );
  }

  return (
    <Card variant="outlined" sx={{ border: "1px solid rgba(61,82,213,0.14)", borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 1.2, sm: 1.5 }, "&:last-child": { pb: { xs: 1.2, sm: 1.5 } } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#173a2d", mb: 1 }}>
          Mapa de locales adheridos
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.2 }}>
          Navega el mapa, haz zoom y toca los marcadores para ver el detalle del local.
        </Typography>

        <Box ref={mapContainerRef} sx={{ width: "100%", height: 420, borderRadius: 2, overflow: "hidden" }} />
      </CardContent>
    </Card>
  );
}

export default function LocationsFilterClient({ locations }: LocationsFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const distinct = Array.from(new Set(locations.map((l) => l.category)));
  const categories = ["Todos", ...distinct];

  const categoryCount = locations.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + 1;
    return acc;
  }, { Todos: locations.length });

  const normalizedTerm = normalizeText(searchTerm);
  const filteredLocations = locations.filter((l) => {
    const inCategory = activeCategory === "Todos" || l.category === activeCategory;
    if (!inCategory) return false;
    if (!normalizedTerm) return true;
    return (
      normalizeText(l.name).includes(normalizedTerm) ||
      normalizeText(l.city).includes(normalizedTerm) ||
      normalizeText(l.description).includes(normalizedTerm)
    );
  });

  const hasActiveFilters = activeCategory !== "Todos" || searchTerm.trim().length > 0;

  return (
    <>
      <Card variant="outlined" sx={{ mb: 3, border: "1px solid", borderColor: "rgba(61,82,213,0.12)" }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, "&:last-child": { pb: { xs: 2.5, sm: 3 } } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 1,
              mb: 2.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "primary.main",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "0.75rem",
              }}
            >
              Explora locales
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredLocations.length} resultados · Filtro: {activeCategory}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.5, mb: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, ciudad o descripción"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              disabled={!hasActiveFilters}
              onClick={() => {
                setActiveCategory("Todos");
                setSearchTerm("");
              }}
              sx={{ whiteSpace: "nowrap", px: 3, py: 1 }}
            >
              Limpiar filtros
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={`${cat} (${categoryCount[cat] ?? 0})`}
                onClick={() => setActiveCategory(cat)}
                color={activeCategory === cat ? "primary" : "default"}
                variant={activeCategory === cat ? "filled" : "outlined"}
                size="small"
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2.5 }}>
        <StoresMap locations={filteredLocations} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        {filteredLocations.map((location) => {
          const grad = CATEGORY_GRADIENTS[location.category] ?? { from: "#3D52D5", to: "#6B7FD4" };
          return (
            <Card
              key={location.id}
              variant="outlined"
              sx={{
                border: "1px solid",
                borderColor: "rgba(61,82,213,0.1)",
                overflow: "hidden",
                transition: "transform 0.25s, box-shadow 0.25s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 28px rgba(61,82,213,0.12)",
                },
              }}
            >
              <Box
                sx={{
                  height: 140,
                  background: location.image ? "none" : `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {location.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={location.image}
                    alt={location.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <PhotoCameraIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.35)" }} />
                )}
                <Chip
                  label={location.category}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
              </Box>

              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.3, mb: 1 }}>
                  {location.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {location.description}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                    {location.city}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {filteredLocations.length === 0 && (
        <Box
          sx={{
            mt: 3,
            p: 5,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "rgba(61,82,213,0.15)",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            No encontramos locales con esos filtros. Proba otra categoria o termino de busqueda.
          </Typography>
        </Box>
      )}
    </>
  );
}
