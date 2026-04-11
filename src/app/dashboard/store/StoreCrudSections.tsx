"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { BenefitRow, CouponConsumptionRow, CouponRow, ServiceRow } from "./types";

type ServiceItem = ServiceRow & {
  description: string;
  address: string;
  location: string;
  fk_type_service: number;
  fk_schedule: number;
};

type ServiceTypeOption = {
  id_type_service: number;
  name: string;
};

type ScheduleOption = {
  id_schedule: number;
  week: string;
  weekend: string;
  sunday: string;
};

type CouponStateOption = {
  id_coupon_state: number;
  name: string;
  description: string;
};

type CouponItem = CouponRow & {
  description: string;
  fk_coupon_state: number;
};

function money(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function when(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

function formatDateInput(value: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

function toCodeChunk(value: string, fallback: string): string {
  const cleaned = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return cleaned || fallback;
}

function ensureGuanderCode(codeCoupon: string, couponName?: string): string {
  if (codeCoupon.startsWith("GUANDER-")) {
    return codeCoupon;
  }
  const namePart = toCodeChunk(couponName ?? "CUPON", "CUPON");
  const codePart = toCodeChunk(codeCoupon, "CODIGO");
  return `GUANDER-LOCAL-${namePart}-${codePart}`;
}

function DeleteConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function StoreServicesCrudSection({ initialItems }: { initialItems: ServiceRow[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState<ServiceItem[]>(
    initialItems.map((item) => ({
      ...item,
      description: "",
      address: "",
      location: "",
      fk_type_service: 0,
      fk_schedule: 0,
    })),
  );
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteService, setPendingDeleteService] = useState<ServiceItem | null>(null);

  const [form, setForm] = useState({
    description: "",
    address: "",
    location: "",
    typeServiceId: "",
    scheduleId: "",
    acceptPoint: true,
  });

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/store/services", { cache: "no-store" });
      const json = await readJson<{
        success?: boolean;
        error?: string;
        data?: {
          services: ServiceItem[];
          serviceTypes: ServiceTypeOption[];
          schedules: ScheduleOption[];
        };
      }>(res);

      if (!res.ok || !json.data) {
        throw new Error(json.error ?? "No se pudieron cargar los servicios");
      }

      setServices(json.data.services);
      setServiceTypes(json.data.serviceTypes);
      setSchedules(json.data.schedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  function resetForm() {
    setForm({
      description: "",
      address: "",
      location: "",
      typeServiceId: "",
      scheduleId: "",
      acceptPoint: true,
    });
    setEditingId(null);
  }

  async function handleSubmit() {
    setError("");
    const payload = {
      description: form.description,
      address: form.address,
      location: form.location,
      typeServiceId: Number(form.typeServiceId),
      scheduleId: Number(form.scheduleId),
      acceptPoint: form.acceptPoint,
      idProfessional: editingId ?? undefined,
    };

    const method = editingId ? "PUT" : "POST";

    const res = await fetch("/api/store/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo guardar el servicio");
      return;
    }

    resetForm();
    await loadServices();
  }

  async function handleDelete(idProfessional: number) {
    setError("");
    const res = await fetch(`/api/store/services?idProfessional=${idProfessional}`, {
      method: "DELETE",
    });
    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo eliminar el servicio");
      return;
    }
    await loadServices();
  }

  function startEdit(service: ServiceItem) {
    setEditingId(service.id_professional);
    setForm({
      description: service.description,
      address: service.address,
      location: service.location,
      typeServiceId: String(service.fk_type_service),
      scheduleId: String(service.fk_schedule),
      acceptPoint: service.accept_point === 1,
    });
  }

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ border: "1px solid #d6e4da" }}>
        <CardContent>
          <Typography variant="h6" color="#173a2d">
            Mis Servicios
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Crea, edita y elimina servicios asociados a tu local.
          </Typography>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 2, display: "grid", gap: 1.2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
            <TextField
              label="Descripcion"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Direccion"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Ubicacion"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              fullWidth
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="service-type-label">Tipo de servicio</InputLabel>
              <Select
                labelId="service-type-label"
                value={form.typeServiceId}
                label="Tipo de servicio"
                onChange={(e) => setForm((prev) => ({ ...prev, typeServiceId: e.target.value }))}
              >
                {serviceTypes.map((type) => (
                  <MenuItem key={type.id_type_service} value={String(type.id_type_service)}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="schedule-label">Horario</InputLabel>
              <Select
                labelId="schedule-label"
                value={form.scheduleId}
                label="Horario"
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleId: e.target.value }))}
              >
                {schedules.map((schedule) => (
                  <MenuItem key={schedule.id_schedule} value={String(schedule.id_schedule)}>
                    {`Semana: ${schedule.week} | Sabado: ${schedule.weekend}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={form.acceptPoint}
                  onChange={(e) => setForm((prev) => ({ ...prev, acceptPoint: e.target.checked }))}
                />
              }
              label="Acepta puntos"
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.8 }}>
            <Button variant="contained" sx={{ bgcolor: "#1f4b3b" }} onClick={() => void handleSubmit()}>
              {editingId ? "Actualizar servicio" : "Crear servicio"}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={resetForm}>
                Cancelar edicion
              </Button>
            )}
          </Stack>

          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Servicio</TableCell>
                <TableCell>Descripcion</TableCell>
                <TableCell align="center">Acepta puntos</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>Aun no tienes servicios.</TableCell>
                </TableRow>
              )}
              {services.map((service) => (
                <TableRow key={service.id_professional}>
                  <TableCell>{service.service_name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell align="center">{service.accept_point === 1 ? "Si" : "No"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="outlined" onClick={() => startEdit(service)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setPendingDeleteService(service)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DeleteConfirmDialog
            open={Boolean(pendingDeleteService)}
            title="Eliminar servicio"
            description={`Vas a eliminar el servicio ${pendingDeleteService?.service_name ?? ""}. Esta accion no se puede deshacer.`}
            onCancel={() => setPendingDeleteService(null)}
            onConfirm={() => {
              if (pendingDeleteService) {
                void handleDelete(pendingDeleteService.id_professional);
              }
              setPendingDeleteService(null);
            }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}

export function StorePromotionsCrudSection({ initialItems }: { initialItems: BenefitRow[] }) {
  const [promotions, setPromotions] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeletePromotion, setPendingDeletePromotion] = useState<BenefitRow | null>(null);
  const [form, setForm] = useState({
    description: "",
    reqPoint: "0",
    percentage: "10",
  });

  async function loadPromotions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/store/promotions", { cache: "no-store" });
      const json = await readJson<{ success?: boolean; data?: BenefitRow[]; error?: string }>(res);
      if (!res.ok || !json.data) {
        throw new Error(json.error ?? "No se pudieron cargar promociones");
      }
      setPromotions(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPromotions();
  }, []);

  function resetForm() {
    setForm({ description: "", reqPoint: "0", percentage: "10" });
    setEditingId(null);
  }

  async function handleSubmit() {
    setError("");
    const payload = {
      idBenefitStore: editingId ?? undefined,
      description: form.description,
      reqPoint: Number(form.reqPoint),
      percentage: Number(form.percentage),
    };

    const res = await fetch("/api/store/promotions", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo guardar la promocion");
      return;
    }

    resetForm();
    await loadPromotions();
  }

  async function handleDelete(idBenefitStore: number) {
    const res = await fetch(`/api/store/promotions?idBenefitStore=${idBenefitStore}`, { method: "DELETE" });
    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo eliminar la promocion");
      return;
    }
    await loadPromotions();
  }

  function startEdit(item: BenefitRow) {
    setEditingId(item.id_benefit_store);
    setForm({
      description: item.description,
      reqPoint: String(item.req_point),
      percentage: String(item.percentage),
    });
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid #d6e4da" }}>
      <CardContent>
        <Typography variant="h6" color="#173a2d">
          Mis Promociones
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Gestiona beneficios para clientes de tu local.
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box sx={{ mt: 2, display: "grid", gap: 1.2, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" } }}>
          <TextField
            size="small"
            label="Descripcion"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <TextField
            size="small"
            label="Puntos requeridos"
            type="number"
            value={form.reqPoint}
            onChange={(e) => setForm((prev) => ({ ...prev, reqPoint: e.target.value }))}
          />
          <TextField
            size="small"
            label="Descuento %"
            type="number"
            value={form.percentage}
            onChange={(e) => setForm((prev) => ({ ...prev, percentage: e.target.value }))}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1.8 }}>
          <Button variant="contained" sx={{ bgcolor: "#1f4b3b" }} onClick={() => void handleSubmit()}>
            {editingId ? "Actualizar promocion" : "Crear promocion"}
          </Button>
          {editingId && (
            <Button variant="outlined" onClick={resetForm}>
              Cancelar edicion
            </Button>
          )}
        </Stack>

        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Descripcion</TableCell>
              <TableCell>Puntos</TableCell>
              <TableCell>% OFF</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && promotions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Aun no tienes promociones.</TableCell>
              </TableRow>
            )}
            {promotions.map((promotion) => (
              <TableRow key={promotion.id_benefit_store}>
                <TableCell>{promotion.description}</TableCell>
                <TableCell>{promotion.req_point}</TableCell>
                <TableCell>{promotion.percentage}%</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" onClick={() => startEdit(promotion)}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => setPendingDeletePromotion(promotion)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DeleteConfirmDialog
          open={Boolean(pendingDeletePromotion)}
          title="Eliminar promocion"
          description={`Vas a eliminar la promocion ${pendingDeletePromotion?.description ?? ""}. Esta accion no se puede deshacer.`}
          onCancel={() => setPendingDeletePromotion(null)}
          onConfirm={() => {
            if (pendingDeletePromotion) {
              void handleDelete(pendingDeletePromotion.id_benefit_store);
            }
            setPendingDeletePromotion(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

export function StoreCouponsCrudSection({
  initialCoupons,
  couponConsumptions,
}: {
  initialCoupons: CouponRow[];
  couponConsumptions: CouponConsumptionRow[];
}) {
  const [coupons, setCoupons] = useState<CouponItem[]>(
    initialCoupons.map((coupon) => ({
      ...coupon,
      description: "",
      fk_coupon_state: 0,
    })),
  );
  const [couponStates, setCouponStates] = useState<CouponStateOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [selectedQrCode, setSelectedQrCode] = useState("");
  const [pendingDeleteCoupon, setPendingDeleteCoupon] = useState<CouponItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    expirationDate: "",
    pointReq: "0",
    amount: "0",
    codeCoupon: "",
    couponStateId: "",
    enabled: true,
  });

  async function loadCoupons() {
    setError("");
    const res = await fetch("/api/store/coupons", { cache: "no-store" });
    const json = await readJson<{
      error?: string;
      data?: {
        coupons: CouponItem[];
        couponStates: CouponStateOption[];
      };
    }>(res);

    if (!res.ok || !json.data) {
      setError(json.error ?? "No se pudieron cargar cupones");
      return;
    }

    setCoupons(json.data.coupons);
    setCouponStates(json.data.couponStates);
  }

  useEffect(() => {
    void loadCoupons();
  }, []);

  const effectiveStateId = useMemo(() => {
    if (form.couponStateId) return form.couponStateId;
    return couponStates[0] ? String(couponStates[0].id_coupon_state) : "";
  }, [form.couponStateId, couponStates]);

  async function handleSubmit() {
    setError("");
    const payload = {
      idCoupon: editingId ?? undefined,
      name: form.name,
      description: form.description,
      expirationDate: form.expirationDate,
      pointReq: Number(form.pointReq),
      amount: Number(form.amount),
      codeCoupon: form.codeCoupon,
      couponStateId: Number(effectiveStateId),
      enabled: form.enabled,
    };

    const res = await fetch("/api/store/coupons", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo guardar el cupon");
      return;
    }

    setEditingId(null);
    setForm({
      name: "",
      description: "",
      expirationDate: "",
      pointReq: "0",
      amount: "0",
      codeCoupon: "",
      couponStateId: "",
      enabled: true,
    });

    await loadCoupons();
  }

  async function handleDelete(idCoupon: number) {
    const res = await fetch(`/api/store/coupons?idCoupon=${idCoupon}`, {
      method: "DELETE",
    });
    const json = await readJson<{ error?: string }>(res);
    if (!res.ok) {
      setError(json.error ?? "No se pudo eliminar el cupon");
      return;
    }
    await loadCoupons();
  }

  function startEdit(coupon: CouponItem) {
    setEditingId(coupon.id_coupon);
    setForm({
      name: coupon.name,
      description: coupon.description,
      expirationDate: formatDateInput(coupon.expiration_date),
      pointReq: String(coupon.point_req),
      amount: String(coupon.amount),
      codeCoupon: coupon.code_coupon,
      couponStateId: String(coupon.fk_coupon_state),
      enabled: coupon.state === 1,
    });
  }

  async function showQr(coupon: CouponItem) {
    const displayCode = ensureGuanderCode(coupon.code_coupon, coupon.name);
    const payload = JSON.stringify({ codeCoupon: displayCode, source: "guander-store" });
    const dataUrl = await QRCode.toDataURL(payload, { width: 220, margin: 1 });
    setSelectedQrCode(displayCode);
    setQrDataUrl(dataUrl);
  }

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ border: "1px solid #d6e4da" }}>
        <CardContent>
          <Typography variant="h6" color="#173a2d">
            Cupones
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Crea, edita y elimina cupones. Puedes generar un QR para cada codigo.
          </Typography>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 2, display: "grid", gap: 1.2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
            <TextField label="Nombre" size="small" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <TextField label="Codigo (opcional)" size="small" value={form.codeCoupon} onChange={(e) => setForm((p) => ({ ...p, codeCoupon: e.target.value }))} />
            <TextField
              label="Descripcion"
              size="small"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <TextField
              label="Fecha vencimiento"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.expirationDate}
              onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
            />
            <TextField label="Puntos" type="number" size="small" value={form.pointReq} onChange={(e) => setForm((p) => ({ ...p, pointReq: e.target.value }))} />
            <TextField label="Monto" type="number" size="small" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            <FormControl size="small" fullWidth>
              <InputLabel id="coupon-state-label">Estado de cupon</InputLabel>
              <Select
                labelId="coupon-state-label"
                label="Estado de cupon"
                value={effectiveStateId}
                onChange={(e) => setForm((p) => ({ ...p, couponStateId: e.target.value }))}
              >
                {couponStates.map((state) => (
                  <MenuItem key={state.id_coupon_state} value={String(state.id_coupon_state)}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />}
              label="Cupon habilitado"
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.8 }}>
            <Button variant="contained" sx={{ bgcolor: "#1f4b3b" }} onClick={() => void handleSubmit()}>
              {editingId ? "Actualizar cupon" : "Crear cupon"}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={() => setEditingId(null)}>
                Cancelar edicion
              </Button>
            )}
          </Stack>

          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cupon</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Canjes</TableCell>
                <TableCell>Vence</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>Aun no has creado cupones.</TableCell>
                </TableRow>
              )}
              {coupons.map((coupon) => (
                <TableRow key={coupon.id_coupon}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{coupon.name}</Typography>
                    <Typography variant="caption">{ensureGuanderCode(coupon.code_coupon, coupon.name)}</Typography>
                  </TableCell>
                  <TableCell>{money(coupon.amount)}</TableCell>
                  <TableCell>{coupon.redemptions}</TableCell>
                  <TableCell>{when(coupon.expiration_date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={coupon.coupon_state_name ?? (coupon.state === 1 ? "Activo" : "Inactivo")}
                      sx={{ bgcolor: "#deebdf", color: "#173a2d" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="outlined" onClick={() => startEdit(coupon)}>
                        Editar
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => void showQr(coupon)}>
                        QR
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setPendingDeleteCoupon(coupon)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DeleteConfirmDialog
            open={Boolean(pendingDeleteCoupon)}
            title="Eliminar cupon"
            description={`Vas a eliminar el cupon ${pendingDeleteCoupon?.name ?? ""}. Esta accion no se puede deshacer.`}
            onCancel={() => setPendingDeleteCoupon(null)}
            onConfirm={() => {
              if (pendingDeleteCoupon) {
                void handleDelete(pendingDeleteCoupon.id_coupon);
              }
              setPendingDeleteCoupon(null);
            }}
          />
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid #d6e4da" }}>
        <CardContent>
          <Typography variant="h6" color="#173a2d">
            Codigo QR del cupon
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            QR generado para compartir y canjear por codigo de cupon.
          </Typography>

          <Paper
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              border: "1px dashed #b8d1c0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            {qrDataUrl ? <img src={qrDataUrl} alt={`QR ${selectedQrCode}`} width={220} height={220} /> : <Typography variant="caption">Selecciona un cupon y presiona QR</Typography>}
            {selectedQrCode && <Typography variant="body2">Codigo: {selectedQrCode}</Typography>}
          </Paper>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid #d6e4da" }}>
        <CardContent>
          <Typography variant="h6" color="#173a2d">
            Cupones consumidos
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Registro de clientes que canjearon cupones en tu local.
          </Typography>
          <Table size="small" sx={{ mt: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Cupon</TableCell>
                <TableCell>Codigo</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Puntos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {couponConsumptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>Aun no hay consumos de cupones.</TableCell>
                </TableRow>
              )}
              {couponConsumptions.map((entry) => (
                <TableRow key={entry.id_coupon_buy}>
                  <TableCell>{entry.customer_name} {entry.customer_last_name}</TableCell>
                  <TableCell>{entry.coupon_name}</TableCell>
                  <TableCell>{entry.code_coupon}</TableCell>
                  <TableCell>{money(entry.amount)}</TableCell>
                  <TableCell>{entry.point_req}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}
