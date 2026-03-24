"use client";

import { useMemo, useState } from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export interface OfferCardItem {
  id: number;
  title: string;
  subtitle: string;
  tag: "Profesional" | "Tienda";
}

interface ExclusiveOffersClientProps {
  offers: OfferCardItem[];
}

const FILTERS = ["Todas", "Profesional", "Tienda"] as const;
type OfferFilter = (typeof FILTERS)[number];

export default function ExclusiveOffersClient({ offers }: ExclusiveOffersClientProps) {
  const [activeFilter, setActiveFilter] = useState<OfferFilter>("Todas");

  const filteredOffers = useMemo(() => {
    if (activeFilter === "Todas") return offers;
    return offers.filter((o) => o.tag === activeFilter);
  }, [activeFilter, offers]);

  const counter = useMemo(() => ({
    Todas: offers.length,
    Profesional: offers.filter((o) => o.tag === "Profesional").length,
    Tienda: offers.filter((o) => o.tag === "Tienda").length,
  }), [offers]);

  return (
    <>
      {/* Filter bar */}
      <Card
        variant="outlined"
        sx={{ mb: 3, border: '1px solid', borderColor: 'rgba(61,82,213,0.12)' }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}
            >
              Filtrar beneficios
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredOffers.length} ofertas activas
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {FILTERS.map((filter) => (
              <Chip
                key={filter}
                label={`${filter} (${counter[filter]})`}
                onClick={() => setActiveFilter(filter)}
                color={activeFilter === filter ? 'primary' : 'default'}
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Cards grid */}
      {filteredOffers.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          {filteredOffers.map((offer, index) => (
            <Card
              key={offer.id}
              variant="outlined"
              sx={{
                border: '1px solid',
                borderColor: 'rgba(61,82,213,0.1)',
                bgcolor: 'background.paper',
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 28px rgba(61,82,213,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={offer.tag}
                    size="small"
                    color="primary"
                    sx={{ fontSize: '0.65rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    #{index + 1}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.4 }}>
                  {offer.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {offer.subtitle}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 5,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'rgba(61,82,213,0.15)',
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            No hay beneficios para este filtro en este momento.
          </Typography>
        </Box>
      )}
    </>
  );
}
