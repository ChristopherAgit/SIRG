import { useMemo, useState } from 'react';
import type { InventoryMovementType } from '../models';
import { computeStock, ingredientRepo, movementRepo } from '../lib/repo';
import { ConfirmModal } from '../components/ConfirmModal';
import { Modal } from '../components/Modal';
import { useToast } from '../components/toast/ToastContext';

export function InventoryPage() {
  const [refresh, setRefresh] = useState(0);
  const ingredients = useMemo(() => ingredientRepo.list(), [refresh]);
  const movements = useMemo(() => movementRepo.list(), [refresh]);
  const [confirmMovementId, setConfirmMovementId] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'g', minStock: '' });
  const toast = useToast();

  const [form, setForm] = useState({
    ingredientId: '',
    type: 'in' as InventoryMovementType,
    qty: '',
    reason: '',
  });

  const rows = useMemo(() => {
    return ingredients.map((i) => {
      const stock = computeStock(i.id);
      const min = i.minStock ?? null;
      const isLow = min !== null && stock < min;
      return { ingredient: i, stock, isLow };
    });
  }, [ingredients, refresh]);

  function submit() {
    const ingredientId = form.ingredientId || ingredients[0]?.id;
    if (!ingredientId) {
      toast.push({ type: 'error', title: 'Sin ingredientes', message: 'Crea ingredientes antes de registrar movimientos.' });
      return;
    }
    const qty = Number(form.qty);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.push({ type: 'error', title: 'Cantidad inválida', message: 'Debe ser un número mayor que 0.' });
      return;
    }

    movementRepo.add({
      ingredientId,
      type: form.type,
      qty,
      reason: form.reason.trim() || undefined,
    });
    setForm((f) => ({ ...f, ingredientId: '', qty: '', reason: '' }));
    setRefresh((x) => x + 1);
    toast.push({ type: 'success', title: 'Movimiento guardado', message: 'Se registró correctamente.' });
  }

  function requestRemoveMovement(id: string) {
    setConfirmMovementId(id);
  }

  function removeMovement(id: string) {
    movementRepo.remove(id);
    setRefresh((x) => x + 1);
    toast.push({ type: 'success', title: 'Movimiento eliminado', message: 'Se eliminó del historial.' });
  }

  function ingName(id: string) {
    return ingredients.find((i) => i.id === id)?.name ?? '(Ingrediente)';
  }

  function ingUnit(id: string) {
    return ingredients.find((i) => i.id === id)?.unit ?? '';
  }

  function movementLabel(t: InventoryMovementType) {
    if (t === 'in') return 'Entrada';
    if (t === 'out') return 'Salida';
    return 'Ajuste (set)';
  }

  function movementHint(t: InventoryMovementType) {
    if (t === 'adjust') return 'Ajuste define el stock absoluto.';
    return 'Entrada/Salida suman o restan al stock.';
  }

  function submitNewProduct() {
    const name = newProduct.name.trim();
    const unit = newProduct.unit.trim();
    const minStock = newProduct.minStock.trim() ? Number(newProduct.minStock) : undefined;
    if (!name || !unit) {
      toast.push({ type: 'error', title: 'Datos incompletos', message: 'Nombre y unidad son obligatorios.' });
      return;
    }
    if (minStock !== undefined && (Number.isNaN(minStock) || minStock < 0)) {
      toast.push({ type: 'error', title: 'Stock mínimo inválido', message: 'Debe ser un número mayor o igual a 0.' });
      return;
    }
    const exists = ingredientRepo.list().some((i) => i.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.push({ type: 'error', title: 'Ya existe', message: 'Hay un producto con ese nombre. Edítalo en Ingredientes si hace falta.' });
      return;
    }
    ingredientRepo.create({ name, unit, minStock });
    setNewProduct({ name: '', unit: 'g', minStock: '' });
    setIsAddProductOpen(false);
    setRefresh((x) => x + 1);
    toast.push({ type: 'success', title: 'Producto registrado', message: `Ya puedes registrar entradas de "${name}".` });
  }

  return (
    <div>
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">Inventario</div>
          <div className="adminPageDesc">
            Cada negocio carga lo que tiene en físico. Si compras algo nuevo que no estaba en el sistema, regístralo aquí y luego registra entradas.
          </div>
        </div>
        <div className="adminActions">
          <button className="adminButton primary" type="button" onClick={() => setIsAddProductOpen(true)}>
            + Agregar producto
          </button>
        </div>
      </div>

      <Modal
        open={isAddProductOpen}
        title="Agregar producto al inventario"
        description="Crea un insumo nuevo (harina, bebidas, etc.). Después podrás darle entrada y usarlo en recetas del menú."
        onClose={() => {
          setIsAddProductOpen(false);
          setNewProduct({ name: '', unit: 'g', minStock: '' });
        }}
        footer={
          <>
            <button
              className="adminButton"
              type="button"
              onClick={() => {
                setIsAddProductOpen(false);
                setNewProduct({ name: '', unit: 'g', minStock: '' });
              }}
            >
              Cancelar
            </button>
            <button className="adminButton primary" type="button" onClick={submitNewProduct}>
              Guardar producto
            </button>
          </>
        }
      >
        <div className="adminFormGrid" style={{ margin: 0 }}>
          <div className="col12">
            <label className="adminLabel">Nombre del producto</label>
            <input className="adminInput" value={newProduct.name} onChange={(e) => setNewProduct((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Aceite de oliva" />
          </div>
          <div className="col6">
            <label className="adminLabel">Unidad de medida</label>
            <input className="adminInput" value={newProduct.unit} onChange={(e) => setNewProduct((f) => ({ ...f, unit: e.target.value }))} placeholder="g, ml, unidad, caja..." />
          </div>
          <div className="col6">
            <label className="adminLabel">Stock mínimo alerta (opcional)</label>
            <input className="adminInput" value={newProduct.minStock} onChange={(e) => setNewProduct((f) => ({ ...f, minStock: e.target.value }))} placeholder="Ej: 500" />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmMovementId}
        title="Eliminar movimiento"
        description="Se eliminará este movimiento del historial. Esto recalculará el stock."
        destructive
        confirmText="Eliminar"
        onConfirm={() => {
          if (confirmMovementId) removeMovement(confirmMovementId);
        }}
        onClose={() => setConfirmMovementId(null)}
      />

      <div className="adminCard" style={{ marginBottom: 14 }}>
        <div className="adminCardLabel">Registrar movimiento</div>
        <div className="adminFormGrid">
          <div className="col4">
            <label className="adminLabel">Ingrediente</label>
            <select
              className="adminSelect"
              value={form.ingredientId}
              onChange={(e) => setForm((f) => ({ ...f, ingredientId: e.target.value }))}
            >
              <option value="">— Selecciona —</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} {!i.isActive ? '(inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="col3">
            <label className="adminLabel">Tipo</label>
            <select className="adminSelect" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as InventoryMovementType }))}>
              <option value="in">Entrada</option>
              <option value="out">Salida</option>
              <option value="adjust">Ajuste (set stock)</option>
            </select>
          </div>
          <div className="col3">
            <label className="adminLabel">Cantidad</label>
            <input className="adminInput" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} placeholder="Ej: 500" />
          </div>
          <div className="col2">
            <button className="adminButton primary" type="button" onClick={submit}>
              Guardar
            </button>
          </div>
          <div className="col12">
            <label className="adminLabel">Motivo (opcional)</label>
            <input className="adminInput" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Ej: Compra, Merma, Ajuste..." />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {movementLabel(form.type)}: {movementHint(form.type)}
            </div>
          </div>
        </div>
      </div>

      <div className="adminCard" style={{ marginBottom: 14 }}>
        <div className="adminCardLabel">Stock actual</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin ingredientes.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.ingredient.id} style={r.isLow ? { background: 'rgba(239, 68, 68, 0.10)' } : undefined}>
                  <td>
                    {r.ingredient.name} {!r.ingredient.isActive ? <span style={{ color: 'rgba(255,255,255,0.6)' }}>(inactivo)</span> : null}
                  </td>
                  <td>
                    {r.stock} {r.ingredient.unit}
                  </td>
                  <td>{r.ingredient.minStock ?? '—'}</td>
                  <td>{r.isLow ? 'Bajo' : 'OK'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="adminCard">
        <div className="adminCardLabel">Historial de movimientos</div>
        <table className="adminTable" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ingrediente</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Sin movimientos aún.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{ingName(m.ingredientId)}</td>
                  <td>{movementLabel(m.type)}</td>
                  <td>
                    {m.qty} {ingUnit(m.ingredientId)}
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.75)' }}>{m.reason ?? '—'}</td>
                  <td>
                    <button className="adminButton danger" type="button" onClick={() => requestRemoveMovement(m.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

