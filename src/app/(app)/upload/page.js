"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, Sparkles, Check, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const QUICK_PORTIONS = ["100g", "150g", "1 bowl", "1 cup", "1 piece", "2 rotis"];

export default function UploadMealPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [dataUri, setDataUri] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [items, setItems] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [logging, setLogging] = useState(false);

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(reader.result);
      setPreview(reader.result);
      setItems([]);
      setImageUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const onDetect = async () => {
    if (!dataUri) return;
    setDetecting(true);
    try {
      const res = await authFetch("/api/foods/detect", {
        method: "POST",
        body: JSON.stringify({ imageBase64: dataUri }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.items?.length) {
        toast("No food detected — add items manually", { icon: "🤔" });
      } else {
        toast.success(`Found ${data.items.length} item${data.items.length > 1 ? "s" : ""}`);
      }
      setImageUrl(data.imageUrl || null);
      setItems(
        (data.items || []).map((it) => ({
          foodName: it.name,
          portion: "",
          suggested: it.commonPortion || "",
        }))
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDetecting(false);
    }
  };

  const updateItem = (i, patch) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addManual = () =>
    setItems((arr) => [...arr, { foodName: "", portion: "", suggested: "" }]);

  const allValid = items.length > 0 && items.every((it) => it.foodName?.trim() && it.portion?.trim());

  const onLog = async () => {
    if (!allValid) return toast.error("Add a name and portion for every item");
    setLogging(true);
    try {
      const res = await authFetch("/api/foods/log", {
        method: "POST",
        body: JSON.stringify({
          imageUrl,
          items: items.map(({ foodName, portion }) => ({ foodName, portion })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Logged ${data.log.totalCalories} kcal`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="h-display text-[26px]">Log a meal</h1>
        <p className="text-sm text-[color:var(--text-muted)] mt-0.5">
          Snap, detect, portion — done.
        </p>
      </div>

      {/* Stage 1: photo */}
      <div className="surface p-3">
        {preview ? (
          <motion.img
            key={preview}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            src={preview}
            alt="meal"
            className="w-full h-72 object-cover rounded-2xl"
          />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-72 rounded-2xl grid place-items-center text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] transition"
            style={{ border: "1.5px dashed var(--separator)" }}
          >
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-400/12 text-brand-500 grid place-items-center mb-3">
                <Camera size={22} />
              </div>
              <div className="font-medium text-[color:var(--text)]">Take or upload a photo</div>
              <div className="text-xs mt-1">JPG, PNG, HEIC · up to ~10 MB</div>
            </div>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={onPick}
        />
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" className="flex-1" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} />
            {preview ? "Change" : "Choose"}
          </Button>
          {preview && (
            <Button className="flex-1" loading={detecting} onClick={onDetect}>
              <Sparkles size={16} /> {detecting ? "Detecting" : "Detect food"}
            </Button>
          )}
        </div>
      </div>

      {/* Stage 2: items + portions */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="h-display text-lg">Items & portions</h2>
              <span className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-medium">
                Required
              </span>
            </div>

            {items.map((it, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="surface p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Food name"
                    value={it.foodName}
                    onChange={(e) => updateItem(i, { foodName: e.target.value })}
                  />
                  <button
                    onClick={() => removeItem(i)}
                    className="w-11 h-11 grid place-items-center rounded-2xl text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div>
                  <div className="label flex items-center justify-between">
                    <span>Portion <span className="text-red-500">*</span></span>
                    {it.suggested && (
                      <button
                        type="button"
                        onClick={() => updateItem(i, { portion: it.suggested })}
                        className="text-[11px] text-brand-500 font-medium lowercase"
                      >
                        use suggested · {it.suggested}
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder={it.suggested || "e.g. 150g, 1 bowl, 2 rotis"}
                    value={it.portion}
                    onChange={(e) => updateItem(i, { portion: e.target.value })}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {QUICK_PORTIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateItem(i, { portion: p })}
                        className={`chip ${it.portion === p ? "chip-active" : ""}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={addManual}
              className="w-full surface-flat p-3.5 flex items-center justify-center gap-2 text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] transition"
            >
              <Plus size={16} /> Add another item
            </button>

            <Button className="w-full" loading={logging} disabled={!allValid} onClick={onLog}>
              <Check size={16} /> Confirm & log meal
            </Button>
            {!allValid && (
              <p className="text-xs text-center text-[color:var(--text-muted)]">
                Every item needs a name and portion size
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 && preview && !detecting && (
        <Button variant="ghost" className="w-full" onClick={addManual}>
          <Plus size={16} /> Add food manually (skip AI)
        </Button>
      )}
    </div>
  );
}
