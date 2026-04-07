import { queryD1, CloudflareD1Error } from "@/lib/cloudflare-d1";
import ExclusiveOffersClient, { type OfferCardItem } from "./ExclusiveOffersClient";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

interface BenefitRow {
  id?: number;
  id_benefit_prof?: number;
  id_benefit_store?: number;
  title?: string;
  name?: string;
  description?: string;
  percentage?: number | null;
  fk_store?: number | null;
  fk_professional?: number | null;
  tag?: string;
}

function toOfferItems(rows: BenefitRow[], source: "Profesional" | "Tienda"): OfferCardItem[] {
  return rows
    .map((row, index) => {
      const description = row.description?.trim();
      const percentage = typeof row.percentage === "number" ? row.percentage : null;
      const entityName = row.name?.trim() || row.title?.trim();
      const fallbackTitle =
        source === "Profesional"
          ? "Beneficio para servicios profesionales"
          : "Beneficio para tiendas";
      const id =
        row.id_benefit_prof ??
        row.id_benefit_store ??
        row.id ??
        (source === "Profesional" ? 10_000 + index : 20_000 + index);
      return {
        id,
        title:
          percentage != null
            ? `${percentage}% de descuento${entityName ? ` en ${entityName}` : ""}`
            : entityName || fallbackTitle,
        subtitle:
          description ||
          (source === "Profesional"
            ? "Promoción disponible para dueños de mascotas."
            : "Oferta exclusiva en establecimientos aliados."),
        tag: source,
      };
    })
    .slice(0, 4);
}

async function loadOffersFromD1(): Promise<OfferCardItem[]> {
  const [profResult, storeResult] = await Promise.allSettled([
    queryD1<BenefitRow>("SELECT * FROM benefit_prof ORDER BY 1 DESC LIMIT 8"),
    queryD1<BenefitRow>("SELECT * FROM benefit_store ORDER BY 1 DESC LIMIT 8"),
  ]);
  const profRows = profResult.status === "fulfilled" ? profResult.value : [];
  const storeRows = storeResult.status === "fulfilled" ? storeResult.value : [];
  if (profRows.length === 0 && storeRows.length === 0) {
    if (profResult.status === "rejected") throw profResult.reason;
    if (storeResult.status === "rejected") throw storeResult.reason;
  }
  return [...toOfferItems(profRows, "Profesional"), ...toOfferItems(storeRows, "Tienda")].slice(0, 4);
}

export default async function ExclusiveOffersSection() {
  let offers: OfferCardItem[] = [];
  let error: string | null = null;

  try {
    offers = await loadOffersFromD1();
  } catch (e) {
    error = e instanceof CloudflareD1Error ? e.message : "No se pudieron cargar las promociones.";
  }

  return (
    <Box
      component="section"
      sx={{ bgcolor: '#f0f2fc', py: { xs: 7, md: 10 }, width: '100%' }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' }, mb: 1.5 }}>
            Ofertas exclusivas para dueños
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
            Beneficios especiales para consentir a tu mascota mientras ahorrás.
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <ExclusiveOffersClient offers={offers} />
        )}
      </Container>
    </Box>
  );
}
