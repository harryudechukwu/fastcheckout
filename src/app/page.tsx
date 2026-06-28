"use client";

import "remixicon/fonts/remixicon.css";
import { useEffect, useState, useCallback, useRef } from "react";

type NavItem = {
  label: string;
  icon: string;
  badge?: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Zap", badge: "NEW", icon: "ri-flashlight-fill" },
  { label: "Card", icon: "ri-bank-card-fill" },
  { label: "Transfer", active: true, icon: "ri-building-fill" },
  { label: "Bank", icon: "ri-bank-fill" },
  { label: "USSD", icon: "ri-hashtag" },
  { label: "PayAttitude", icon: "ri-fingerprint-fill" },
  { label: "OPay", icon: "ri-secure-payment-fill" },
] as const;

function CopyBtn({ value }: { value: string }) {
  const handleClick = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  }, [value]);

  return (
    <button onClick={handleClick} className="flex items-center justify-center shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="3.5" y="1.5" width="9" height="10" rx="1" stroke="#999" strokeWidth="1.2" fill="none" />
        <path d="M1.5 4.5v8a1 1 0 001 1h7" stroke="#999" strokeWidth="1.2" fill="none" />
      </svg>
    </button>
  );
}

const STORAGE_KEY = "fab-pos";

function Fab({ onClick }: { onClick: () => void }) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    startX: 0, startY: 0, startTx: 0, startTy: 0, tx: 0, ty: 0, dragging: false,
  });
  const SIZE = 56;
  const RIGHT = 24;
  const BOTTOM = 24;
  const CLICK_THRESHOLD = 15;

  const save = useCallback((tx: number, ty: number) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ tx, ty })); } catch {}
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { tx, ty } = JSON.parse(saved);
        const minTx = RIGHT + SIZE - window.innerWidth;
        const maxTx = RIGHT;
        const minTy = BOTTOM + SIZE - window.innerHeight;
        const maxTy = BOTTOM;
        dragRef.current.tx = Math.max(minTx, Math.min(maxTx, tx));
        dragRef.current.ty = Math.max(minTy, Math.min(maxTy, ty));
        el.style.transform = `translate(${dragRef.current.tx}px, ${dragRef.current.ty}px)`;
      }
    } catch {}

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const totalDx = e.clientX - dragRef.current.startX;
      const totalDy = e.clientY - dragRef.current.startY;
      const rawTx = dragRef.current.startTx + totalDx;
      const rawTy = dragRef.current.startTy + totalDy;
      const minTx = RIGHT + SIZE - window.innerWidth;
      const maxTx = RIGHT;
      const minTy = BOTTOM + SIZE - window.innerHeight;
      const maxTy = BOTTOM;
      dragRef.current.tx = Math.max(minTx, Math.min(maxTx, rawTx));
      dragRef.current.ty = Math.max(minTy, Math.min(maxTy, rawTy));
      el.style.transform = `translate(${dragRef.current.tx}px, ${dragRef.current.ty}px)`;
    };

    const onUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      const totalDx = dragRef.current.tx - dragRef.current.startTx;
      const totalDy = dragRef.current.ty - dragRef.current.startTy;
      if (Math.abs(totalDx) < CLICK_THRESHOLD && Math.abs(totalDy) < CLICK_THRESHOLD) {
        onClick();
        return;
      }
      save(dragRef.current.tx, dragRef.current.ty);
      const sx = dragRef.current.tx;
      const sy = dragRef.current.ty;
      el.animate([
        { transform: `translate(${sx}px, ${sy}px)`, offset: 0 },
        { transform: `translate(${sx - 12}px, ${sy}px)`, offset: 0.15 },
        { transform: `translate(${sx + 8}px, ${sy}px)`, offset: 0.3 },
        { transform: `translate(${sx - 5}px, ${sy}px)`, offset: 0.5 },
        { transform: `translate(${sx + 3}px, ${sy}px)`, offset: 0.7 },
        { transform: `translate(${sx - 1}px, ${sy}px)`, offset: 0.85 },
        { transform: `translate(${sx}px, ${sy}px)`, offset: 1 },
      ], { duration: 500, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" });
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.startTx = dragRef.current.tx;
      dragRef.current.startTy = dragRef.current.ty;
      dragRef.current.dragging = true;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    };

    el.addEventListener("pointerdown", onDown);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
    };
  }, [onClick]);

  return (
    <div
      ref={elRef}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#6F5BD0] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-50 select-none touch-none"
    >
      <i className="ri-flashlight-fill text-white text-[26px]" />
    </div>
  );
}

function PinDots({ pin }: { pin: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[0, 1, 2, 3].map((i) => {
        const filled = i < pin.length;
        return (
          <div
            key={`${i}-${filled}`}
            className={`w-3.5 h-3.5 rounded-full border ${
              filled ? "bg-[#6F5BD0] border-[#6F5BD0] animate-pin-dot-bump" : "bg-white border-[#CCCCCC]"
            }`}
          />
        );
      })}
    </div>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}

function FabModal({ onClose, onBackToCheckout }: { onClose: () => void; onBackToCheckout: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleBackToCheckout = useCallback(() => {
    setClosing(true);
    setTimeout(onBackToCheckout, 200);
  }, [onBackToCheckout]);

  const focusPin = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handlePay = useCallback(() => {
    setStep(2);
    // Focus synchronously inside the click handler so mobile browsers treat it
    // as part of the user gesture and actually open the native keyboard.
    focusPin();
  }, [focusPin]);

  const handleBack = useCallback(() => {
    setPin("");
    setStep(1);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pin.length !== 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 4000);
  }, [pin]);

  const visible = entered && !closing;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[5px] transition-opacity duration-200 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-[calc(100vw-50px)] max-w-[400px] bg-white rounded-[12px] shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ width: "300%", transform: `translateX(-${(step - 1) * (100 / 3)}%)` }}
          >
            {/* State 1: Transfer summary */}
            <div className="p-6 flex flex-col" style={{ flex: "0 0 33.3333%" }}>
              <div className="text-[18px] font-bold text-[#1D334A] mb-1 text-center">Fast Checkout</div>
              <div className="w-full text-[14px] text-[#777] text-center mb-5 px-5 leading-tight">
                Please confirm the details matches what is being displayed on the checkout page
              </div>
              <div className="min-w-0 bg-[#F3F3F3] rounded-[7px] px-5 py-5 flex flex-col">
                <div className="mb-[22px]">
                  <div className="text-[11px] font-semibold text-[#5C636B] uppercase tracking-[0.3px] mb-[7px]">BANK NAME</div>
                  <div className="text-[14px] font-semibold text-[#344157]">Paystack-Titan</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#5C636B] uppercase tracking-[0.3px] mb-[7px]">ACCOUNT NUMBER</div>
                  <div className="text-[14px] font-semibold text-[#344157]">9886623425</div>
                </div>
              </div>
              <button
                onClick={handlePay}
                className="w-full h-[42px] bg-[#6F5BD0] text-white rounded-[4px] text-[14px] font-medium mt-4 cursor-pointer hover:bg-[#5C4AB8] transition-colors"
              >
                Pay NGN 1,015.23
              </button>
            </div>

            {/* State 2: PIN entry */}
            <div className="relative p-6 flex flex-col" style={{ flex: "0 0 33.3333%" }}>
              <button
                onClick={handleBack}
                className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center cursor-pointer text-[#1D334A]"
              >
                <i className="ri-arrow-left-line text-[20px]" />
              </button>

              <div className="flex-1 flex flex-col items-center justify-center gap-4" onClick={focusPin}>
                <div className="text-[16px] font-bold text-[#1D334A]">Enter your PIN</div>
                <PinDots pin={pin} />
              </div>

              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="opacity-0 absolute pointer-events-none"
              />

              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center gap-1.5 bg-[#F3F3F3] border border-[#E5E5E5] rounded-full px-3 py-1">
                  <i className="ri-lock-2-fill text-[11px] text-[#6F5BD0]" />
                  <span className="text-[11px] font-semibold text-[#5C636B]">Secured Input</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={pin.length !== 4}
                className="w-full h-[42px] rounded-[4px] text-[14px] font-medium cursor-pointer disabled:cursor-not-allowed"
                style={{
                  backgroundColor: pin.length === 4 ? "#6F5BD0" : "#ccc",
                  color: "#fff",
                }}
              >
                Confirm
              </button>

              {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <LoaderIcon className="w-8 h-8 text-[#9AA0A6] animate-spin" />
                </div>
              )}
            </div>

            {/* State 3: Success */}
            <div key={step} className="px-6 pb-6 pt-[40px] flex flex-col" style={{ flex: "0 0 33.3333%" }}>
              <div className="flex-1 flex flex-col items-center justify-start text-center">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#6F5BD0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-draw-circle"
                  />
                  <path
                    d="M17 29 L24 35 L39 21"
                    fill="none"
                    stroke="#6F5BD0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-draw-check"
                  />
                </svg>
                <div className="text-[16px] font-bold text-[#1D334A] mt-[15px] animate-success-fade">Payment Sent!</div>
                <div className="text-[14px] text-[#777] mt-[5px] animate-success-fade">
                  NGN 1,015.23 has been successfully sent to <span className="font-bold">Paystack-Titan</span>
                </div>
              </div>

              <button
                onClick={handleBackToCheckout}
                className="w-full h-[42px] bg-[#F3F3F3] rounded-[4px] text-[14px] font-medium text-[#666] mb-3 cursor-pointer hover:bg-[#EAEAEA] transition-colors animate-success-fade"
              >
                Back to checkout
              </button>
              <button
                onClick={() => console.log("View receipt")}
                className="w-full h-[42px] bg-[#6F5BD0] text-white rounded-[4px] text-[14px] font-medium cursor-pointer hover:bg-[#5C4AB8] transition-colors animate-success-fade"
              >
                View Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleClose}
        className="mt-5 w-10 h-10 bg-white/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/60 transition-colors"
      >
        <i className="ri-close-line text-white text-[22px]" />
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const [visible, setVisible] = useState(true);
  const [fabModal, setFabModal] = useState(false);
  const [seconds, setSeconds] = useState(29 * 60 + 52);
  const [mainStage, setMainStage] = useState<"checkout" | "loading" | "success">("checkout");
  const handleFabClick = useCallback(() => setFabModal(true), []);

  const handleBackToCheckout = useCallback(() => {
    setFabModal(false);
    setMainStage("loading");
    setTimeout(() => setMainStage("success"), 4000);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timerStr = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");

  if (!visible) return null;

  return (
    <div className="min-h-screen w-full bg-white font-sans flex items-center justify-center">
      <div className="w-[calc(100vw-30px)] max-w-[480px] flex flex-col items-center gap-[25px]">
      <div className="relative w-full h-[564px] rounded-[20px] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ width: "200%", transform: `translateX(${mainStage === "success" ? "-50%" : "0%"})` }}
        >
          {/* Card: sidebar + header + checkout content, slides away as one unit */}
          <div className="relative flex border border-[#E0E0E0] rounded-[20px]" style={{ flex: "0 0 50%" }}>

            <div className="w-[130px] min-w-[120px] bg-[#F4F4F4] rounded-l-[20px] flex flex-col shrink-0 border-r border-[#E0E0E0]">
              <div className="h-[66px] flex items-start pt-[33px] pl-[15px]">
                <span className="text-[12px] font-bold text-[#4C4C4C] tracking-[0.3px]">PAY WITH</span>
              </div>
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative h-[49px] flex items-center px-[15px] gap-[10px] border-b border-[#E3E3E3] min-w-0"
                  >
                    <i className={`${item.icon} text-[16px] ${item.active ? "text-[#0AAF5B]" : "text-[#7A7A7A]"}`} />
                    <span
                      className={`min-w-0 truncate text-[13px] leading-[1] font-bold ${
                        item.active ? "text-[#0AAF5B]" : "text-[#7A7A7A]"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center p-[3px] bg-[#E53935] rounded-[3px] text-[8px] font-bold text-white leading-[1.2] shrink-0">
                        {item.badge}
                      </span>
                    )}
                    {item.active && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#0AAF5B]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0 bg-white rounded-r-[20px] flex flex-col">
              <div className="h-[66px] flex items-center gap-3 px-5 border-b border-[#EEEEEE] shrink-0 min-w-0">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <i className="ri-spotify-fill text-[28px] text-[#1DB954]" />
                </div>
                <div className="ml-auto min-w-0 basis-[158px] max-w-[158px] text-right">
                  <div className="truncate text-[13px] text-[#777] leading-[1.3]">udechukwuharrison4@gma...</div>
                  <div className="text-[14px] text-[#777] leading-[1.4] whitespace-nowrap">
                    Pay <strong className="text-[#12AD5C] font-bold">NGN 1,015.23</strong>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col pt-[33px] px-5 pb-5">
                <div className="text-[14px] font-bold text-[#1D334A] leading-[1.4] mb-5">
                  Transfer NGN 1,015.23 to <span className="uppercase">PAYSTACK CHECKOUT</span>
                </div>

                <div className="w-full bg-[#F3F3F3] rounded-[7px] px-5 py-5 flex flex-col">
                  <div className="mb-[22px]">
                    <div className="text-[9px] font-semibold text-[#5C636B] uppercase tracking-[0.3px] mb-[7px]">BANK NAME</div>
                    <div className="flex items-center justify-between min-w-0">
                      <span className="min-w-0 truncate text-[14px] font-semibold text-[#344157]">Paystack-Titan</span>
                    </div>
                  </div>
                  <div className="mb-[22px]">
                    <div className="text-[9px] font-semibold text-[#5C636B] uppercase tracking-[0.3px] mb-[7px]">ACCOUNT NUMBER</div>
                    <div className="flex items-center justify-between min-w-0 gap-3">
                      <span className="min-w-0 truncate text-[14px] font-semibold text-[#344157]">9886623425</span>
                      <CopyBtn value="9886623425" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-[#5C636B] uppercase tracking-[0.3px] mb-[7px]">AMOUNT</div>
                    <div className="flex items-center justify-between min-w-0 gap-3">
                      <span className="min-w-0 truncate text-[14px] font-semibold text-[#344157]">NGN 1,015.23</span>
                      <CopyBtn value="NGN 1,015.23" />
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-[#B7BEC3] my-[19px]" />

                <div className="text-[12px] leading-[16px] text-[#6A7079] flex-1">
                  Search for Paystack-Titan or Titan-Paystack in your bank app. This account is for this transaction only and expires in{" "}
                  <span className={seconds < 60 ? "text-[#E53935] font-semibold" : "text-[#14B665] font-semibold"}>
                    {timerStr}
                  </span>
                </div>

                <button
                  onClick={() => console.log("Payment confirmed: NGN 1,015.23 to Paystack-Titan")}
                  className="w-full h-[42px] bg-white border border-[#DCDCDC] rounded-[4px] text-[14px] font-medium text-[#666] mt-[14px] flex items-center justify-center cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                >
                  I&apos;ve sent the money
                </button>
              </div>
            </div>

            {mainStage === "loading" && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-[20px]">
                <LoaderIcon className="w-8 h-8 text-[#9AA0A6] animate-spin" />
              </div>
            )}
          </div>

          {/* Bare success view, centered, no card chrome */}
          <div
            key={mainStage}
            className="flex flex-col items-center justify-center text-center px-5"
            style={{ flex: "0 0 50%" }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#0AAF5B"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-draw-circle"
              />
              <path
                d="M17 29 L24 35 L39 21"
                fill="none"
                stroke="#0AAF5B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-check"
              />
            </svg>
            <div className="text-[16px] font-bold text-[#1D334A] mt-[15px] animate-success-fade">Payment Sent!</div>
            <div className="text-[14px] text-[#777] mt-[5px] animate-success-fade">
              NGN 1,015.23 has been successfully sent to <span className="font-bold">Spotify Inc</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[6px] text-[#999] text-[15px]">
        <span className="flex items-center opacity-50">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <rect x="2.5" y="5.5" width="7" height="5" rx=".5" stroke="#999" strokeWidth="1" />
            <path d="M4 5.5V3.5a2 2 0 014 0v2" stroke="#999" strokeWidth="1" fill="none" />
          </svg>
        </span>
        <span>Secured by</span>
        <span className="text-[#b0b0b0] font-semibold">paystack</span>
      </div>
      </div>
      {mainStage !== "success" && <Fab onClick={handleFabClick} />}
      {fabModal && <FabModal onClose={() => setFabModal(false)} onBackToCheckout={handleBackToCheckout} />}
    </div>
  );
}
