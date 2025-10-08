"use client";

import React, { useState, useEffect, useRef } from "react";

// UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Check,
  Star,
  Users,
  Shield,
  Upload,
  User,
  Menu,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

/* =====================================================
   Helpers
===================================================== */
const scrollToId = (id: string) => {
  if (typeof window !== "undefined") {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// small utility and nav link
function clsx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function NavLink({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: (id:string)=>void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={clsx(
        "relative rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        active ? "text-foreground" : "hover:text-foreground"
      )}
    >
      <span>{label}</span>
      <span
        className={clsx(
          "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        )}
      />
    </button>
  );
}

/* =====================================================
   AUTH DIALOG — Register/Login + Plan + extra consents + captcha
===================================================== */
function AuthDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: (plan: "community" | "participant") => void }) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [plan, setPlanLocal] = useState<"community" | "participant">("community");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [err, setErr] = useState("");

  function validate() {
    setErr("");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Укажите корректный e‑mail");
    if (mode === "register") {
      if (!fullName || fullName.trim().length < 2) return setErr("Укажите ФИО");
      if (!tel || tel.length < 6) return setErr("Укажите телефон");
      if (!pw || pw.length < 6) return setErr("Пароль от 6 символов");
      if (!agree) return setErr("Подтвердите Политику ПДн/Соглашение");
      if (!agreeOffer) return setErr("Нужно согласие с публичной офертой");
      if (!agreeRules) return setErr("Нужно согласие с правилами голосования");
      if (!captcha) return setErr("Подтвердите, что вы не робот");
    } else {
      if (!pw) return setErr("Введите пароль");
    }
    return true;
  }

  function submit() {
    if (!validate()) return;
    onSuccess(plan);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 pl-6 pr-16 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Без донатов • 3 голоса у каждого</span>
            </div>
            <div className="flex gap-1 rounded-full bg-white/15 p-1 mr-2">
              <button onClick={() => setMode("register")} className={`px-3 py-1 text-sm rounded-full ${mode === "register" ? "bg-white text-indigo-700" : "text-white/90"}`}>Регистрация</button>
              <button onClick={() => setMode("login")} className={`px-3 py-1 text-sm rounded-full ${mode === "login" ? "bg-white text-indigo-700" : "text-white/90"}`}>Вход</button>
            </div>
          </div>
          <h3 className="mt-3 text-xl font-semibold">{mode === "register" ? "Начните сезон с нами" : "С возвращением"}</h3>
          <p className="text-white/80 text-sm">Выберите план доступа и продолжите.</p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">План доступа</CardTitle>
              <CardDescription>Оплата невозвратная; автопродление только у подписки.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 ${plan === "community" ? "border-indigo-500 bg-indigo-50" : "hover:border-indigo-300"}`}>
                <div>
                  <div className="text-sm font-semibold">Сообщество</div>
                  <div className="text-xs text-muted-foreground">1 000 ₽/мес • 3 голоса/подкатегория • коммьюнити</div>
                </div>
                <input type="radio" name="plan" checked={plan === "community"} onChange={() => setPlanLocal("community")} className="h-4 w-4"/>
              </label>
              <label className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 ${plan === "participant" ? "border-violet-500 bg-violet-50" : "hover:border-violet-300"}`}>
                <div>
                  <div className="text-sm font-semibold">Участник</div>
                  <div className="text-xs text-muted-foreground">2 500 ₽ за сезон • 1 проект (макс. 2); 2‑й +5 000 ₽</div>
                </div>
                <input type="radio" name="plan" checked={plan === "participant"} onChange={() => setPlanLocal("participant")} className="h-4 w-4"/>
              </label>
              <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">Право голоса активируется через <b>24 часа</b> после оплаты — антинакрутка.</div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {mode === "register" && (
              <div>
                <Label>ФИО</Label>
                <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Иванов Иван Иванович"/>
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
            {mode === "register" && (
              <div>
                <Label>Телефон</Label>
                <Input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+7…"/>
              </div>
            )}
            <div>
              <Label>Пароль</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••"/>
            </div>
            {mode === "register" && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="agree" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
                  <Label htmlFor="agree" className="text-sm">Согласен с <a className="underline" href="#docs-end">Политикой ПДн</a> и <a className="underline" href="#docs-end">Пользовательским соглашением</a></Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="agreeOffer" checked={agreeOffer} onCheckedChange={(v) => setAgreeOffer(!!v)} />
                  <Label htmlFor="agreeOffer" className="text-sm">Принимаю <a className="underline" href="#docs-end">Публичную оферту</a></Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="agreeRules" checked={agreeRules} onCheckedChange={(v) => setAgreeRules(!!v)} />
                  <Label htmlFor="agreeRules" className="text-sm">Согласен с <a className="underline" href="#docs-end">Правилами голосования и модерации</a></Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="captcha" checked={captcha} onCheckedChange={(v) => setCaptcha(!!v)} />
                  <Label htmlFor="captcha" className="text-sm">Я не робот</Label>
                </div>
              </>
            )}
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="pt-2">
              <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={submit}>Продолжить</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================
   Payment Modal (reusable)
===================================================== */
function PaymentModal({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Обновление тарифа до «Участника»</DialogTitle>
          <DialogDescription>Оплата разового доступа на сезон</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border p-3 text-sm">
            <div className="flex items-center justify-between"><span>«Участник»</span><span className="text-base font-semibold">2 500 ₽</span></div>
            <p className="mt-1 text-xs text-muted-foreground">Включает право подать 1 проект (2‑й +5 000 ₽).</p>
          </div>
          <div>
            <Label>Способ оплаты</Label>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option>Банковская карта</option>
              <option>ЮKassa / СБП</option>
              <option>CloudPayments</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Имя на карте" />
            <Input placeholder="Номер карты" />
            <Input placeholder="MM/YY" />
            <Input placeholder="CVC" />
          </div>
          <Button className="w-full bg-violet-600 text-white hover:bg-violet-700" onClick={onSuccess}>Оплатить и обновить</Button>
          <p className="text-xs text-muted-foreground">* Заглушка оплаты. Здесь подключим провайдера (Stripe/ЮKassa/CloudPayments).</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================
   Brief Modal
===================================================== */
function BriefModal({ open, onClose, track }: { open: boolean; onClose: () => void; track: string | null; }) {
  if (!open || !track) return null;
  const title = `Бриф — ${track}`;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Критерии, требования к материалам, дедлайны сезона</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Критерии (веса)</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Соответствие брифу — 20%</li>
              <li>Оригинальность — 20%</li>
              <li>Потенциал — 20%</li>
              <li>Производственная готовность — 20%</li>
              <li>Влияние/этика — 10%</li>
              <li>Качество подачи — 10%</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Материалы</div>
            <ul className="list-disc pl-5 space-y-1">
              {track.includes("Шоу") ? (
                <>
                  <li>Видео 15–60 сек (обязательно) + портфолио.</li>
                </>
              ) : (
                <>
                  <li>Идея/макет/лендинг/MVP; текстовое резюме, скриншоты.</li>
                </>
              )}
              <li>Права на материалы подтверждаются участником.</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================
   Account PAGE — with left nav (Профиль / Мои проекты / Настройки)
===================================================== */
function AccountPage({ plan, setPlan, avatarUrl, setAvatarUrl, onUpgradeClick, goHome, fullName, setFullName, projects, setProjects }: { plan: "community" | "participant"; setPlan: (p: "community" | "participant") => void; avatarUrl: string | null; setAvatarUrl: (u: string | null) => void; onUpgradeClick: () => void; goHome: () => void; fullName: string; setFullName: (v: string)=>void; projects: any[]; setProjects: (v: any[])=>void; }) {
  const [tab, setTab] = useState<'profile'|'projects'|'settings'>('profile');
  const [status, setStatus] = useState<string>(plan === 'participant' ? 'Участник' : 'Сообщество');
  const [bio, setBio] = useState("");
  const [tel, setTel] = useState("");
  const [site, setSite] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState("");

  // Projects
  const [pTitle, setPTitle] = useState("");
  const [pTrack, setPTrack] = useState("Шоу-бизнес");
  const [pSub, setPSub] = useState("Певцы и музыканты");
  const [pLink, setPLink] = useState("");
  const [pFiles, setPFiles] = useState("");
  const projectLimit = 2;

  const onAvatarFile = (file?: File | null) => {
    if (!file) return setAvatarUrl(null);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const submitProject = () => {
    if (!pTitle || !pLink) return alert('Укажите название и ссылку на проект');
    const row = { id: Date.now(), no: (projects?.length || 0) + 1, track: pTrack, sub: pSub, date: new Date().toLocaleDateString(), result: 'На модерации', link: pLink, files: pFiles, title: pTitle };
    setProjects([...(projects||[]), row]);
    setPTitle(""); setPLink(""); setPFiles("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-violet-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600 transition group-hover:scale-110" />
            <span className="whitespace-nowrap font-semibold group-hover:text-indigo-700">Платформа талантов</span>
          </button>

          {/* Desktop nav */}
          <nav className="relative hidden items-center gap-1 md:flex">
            <NavLink id="how" label="Как это работает" active={activeId==='how'} onClick={scrollToId} />
            <NavLink id="forwhom" label="Для кого?" active={activeId==='forwhom'} onClick={scrollToId} />
            <NavLink id="roles" label="Роли" active={activeId==='roles'} onClick={scrollToId} />
            <NavLink id="pricing" label="Тарифы" active={activeId==='pricing'} onClick={scrollToId} />
            <NavLink id="tracks" label="Треки и брифы" active={activeId==='tracks'} onClick={scrollToId} />

            {/* Dropdown: Участники */}
            <div ref={navPartRef} className="relative"
                 onMouseEnter={openNavPart} onMouseLeave={closeNavPart}>
              <button onClick={() => setNavPartOpen(v=>!v)}
                      className={clsx("group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors",
                                      "text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                      activeId==='showcase' && 'text-foreground')}
                      aria-haspopup="true" aria-expanded={navPartOpen}>
                Участники
                <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", navPartOpen && 'rotate-180')} />
              </button>
              {navPartOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-[600px] -translate-x-1/2 rounded-2xl border bg-white p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="mb-1 text-xs uppercase text-muted-foreground">Шоу‑бизнес</div>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('show_singers')}>Певцы и музыканты <ChevronRight className="h-3.5 w-3.5"/></button>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('show_actors')}>Актеры <ChevronRight className="h-3.5 w-3.5"/></button>
                    </div>
                    <div>
                      <div className="mb-1 text-xs uppercase text-muted-foreground">Предприниматели</div>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('biz_online')}>Онлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></button>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('biz_offline')}>Оффлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {['Авторы','Эксперты','Кандидаты','Инвесторы'].map((t,i)=> (
                      <button key={t} onClick={()=> openPage(['authors','experts','candidates','investors'][i])}
                              className="rounded-lg border px-2 py-1.5 text-xs hover:bg-muted">{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <NavLink id="showcase" label="Витрина" active={activeId==='showcase'} onClick={scrollToId} />
            <NavLink id="faq" label="FAQ" active={activeId==='faq'} onClick={scrollToId} />
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <Button variant="ghost" className="hidden md:inline-flex text-indigo-700 hover:text-indigo-900" onClick={() => setOpenAuth(true)}>
                Войти
              </Button>
            )}
            {isAuthed && plan === 'participant' && (
              <Button variant="outline" className="hidden md:inline-flex border-indigo-300 text-indigo-700 hover:bg-indigo-50" onClick={goAccount}>
                Подать проект
              </Button>
            )}
            {/* Avatar */}
            <button
              onClick={() => (isAuthed ? goAccount() : setOpenAuth(true))}
              className="h-10 w-10 overflow-hidden rounded-full border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Аккаунт" title="Аккаунт"
            >
              {avatarUrl ? (
                <img alt="avatar" src={avatarUrl} className="h-full w-full object-cover"/>
              ) : (
                <div className="flex h-full w-full items-center justify-center"><User className="h-5 w-5 text-muted-foreground"/></div>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(v=>!v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
              aria-label="Меню"
            >
              <Menu className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="md:hidden">
            <div className="mx-auto max-w-6xl px-4 pb-3">
              <div className="rounded-2xl border bg-white p-3 shadow-lg">
                <div className="grid gap-1">
                  {[{id:'how',label:'Как это работает'},{id:'forwhom',label:'Для кого?'},{id:'roles',label:'Роли'},{id:'pricing',label:'Тарифы'},{id:'tracks',label:'Треки и брифы'},{id:'showcase',label:'Витрина'},{id:'faq',label:'FAQ'}].map(i => (
                    <button key={i.id} onClick={()=>{ setMobileOpen(false); scrollToId(i.id); }} className="rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">{i.label}</button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={()=>{ setMobileOpen(false); openCategory('show_singers'); }}>Певцы и музыканты</Button>
                  <Button variant="secondary" onClick={()=>{ setMobileOpen(false); openCategory('show_actors'); }}>Актеры</Button>
                  <Button variant="secondary" onClick={()=>{ setMobileOpen(false); openCategory('biz_online'); }}>Онлайн‑бизнес</Button>
                  <Button variant="secondary" onClick={()=>{ setMobileOpen(false); openCategory('biz_offline'); }}>Оффлайн‑бизнес</Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={()=>{ setMobileOpen(false); openPage('authors'); }}>Авторы</Button>
                  <Button variant="outline" onClick={()=>{ setMobileOpen(false); openPage('experts'); }}>Эксперты</Button>
                  <Button variant="outline" onClick={()=>{ setMobileOpen(false); openPage('candidates'); }}>Кандидаты</Button>
                  <Button variant="outline" onClick={()=>{ setMobileOpen(false); openPage('investors'); }}>Инвесторы</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left nav */}
          <aside className="md:col-span-3">
            <Card className="sticky top-20 rounded-2xl">
              <CardHeader className="pb-2"><CardTitle className="text-base">Меню</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <button onClick={()=>setTab('profile')} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab==='profile'?'bg-indigo-600 text-white':'hover:bg-muted'}`}>Профиль</button>
                <button onClick={()=>setTab('projects')} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab==='projects'?'bg-indigo-600 text-white':'hover:bg-muted'}`}>Мои проекты</button>
                <button onClick={()=>setTab('settings')} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab==='settings'?'bg-indigo-600 text-white':'hover:bg-muted'}`}>Настройки</button>
              </CardContent>
            </Card>
          </aside>

          {/* Right content */}
          <section className="md:col-span-9 space-y-6">
            {tab==='profile' && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Профиль</CardTitle>
                  <CardDescription>ФИО, статус, аватар, краткое описание</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="h-28 w-28 overflow-hidden rounded-full border bg-muted">
                      {avatarUrl ? <img alt="avatar" src={avatarUrl} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center"><User className="h-6 w-6 text-muted-foreground"/></div>}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                      <Upload className="h-4 w-4"/> Загрузить
                      <input type="file" className="hidden" accept="image/*" onChange={(e)=>onAvatarFile(e.target.files?.[0]||null)} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>ФИО</Label>
                      <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Иванов Иван"/>
                    </div>
                    <div>
                      <Label>Статус</Label>
                      <select value={status} onChange={(e)=>setStatus(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                        <option>Участник</option>
                        <option>Автор</option>
                        <option>Эксперт</option>
                        <option>Инвестор</option>
                        <option>Сообщество</option>
                      </select>
                    </div>
                    <div>
                      <Label>О себе</Label>
                      <Textarea rows={4} value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Короткое описание"/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab==='projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Мои проекты</h2>
                  {plan==='participant' ? (
                    (projects?.length||0) < projectLimit ? (
                      <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={()=>document.getElementById('add-proj')?.scrollIntoView({behavior:'smooth'})}>Добавить проект</Button>
                    ) : (
                      <Button className="bg-amber-600 text-white hover:bg-amber-700" onClick={onUpgradeClick}>Увеличить лимит (+5 000 ₽)</Button>
                    )
                  ) : (
                    <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={onUpgradeClick}>Стать участником</Button>
                  )}
                </div>

                {(projects?.length||0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-3 py-2">№</th>
                          <th className="px-3 py-2">Трек</th>
                          <th className="px-3 py-2">Подкатегория</th>
                          <th className="px-3 py-2">Дата опубликования</th>
                          <th className="px-3 py-2">Результаты</th>
                          <th className="px-3 py-2">Ссылка</th>
                          <th className="px-3 py-2">Файлы</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p:any)=> (
                          <tr key={p.id} className="odd:bg-white even:bg-muted/20">
                            <td className="px-3 py-2">{p.no}</td>
                            <td className="px-3 py-2">{p.track}</td>
                            <td className="px-3 py-2">{p.sub}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{p.date}</td>
                            <td className="px-3 py-2">{p.result}</td>
                            <td className="px-3 py-2 text-indigo-600 underline"><a href={p.link}>ссылка</a></td>
                            <td className="px-3 py-2 text-indigo-600 underline">{p.files ? <a href={p.files}>файлы</a> : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {plan==='participant' && (projects?.length||0) < projectLimit && (
                  <Card id="add-proj" className="rounded-2xl">
                    <CardHeader><CardTitle>Добавить проект</CardTitle><CardDescription>Видео/лендинг/MVP + файлы</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2"><Label>Название</Label><Input value={pTitle} onChange={(e)=>setPTitle(e.target.value)} placeholder="Название проекта"/></div>
                      <div><Label>Трек</Label>
                        <select value={pTrack} onChange={(e)=>setPTrack(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                          <option>Шоу-бизнес</option>
                          <option>Бизнес</option>
                        </select>
                      </div>
                      <div><Label>Подкатегория</Label>
                        <select value={pSub} onChange={(e)=>setPSub(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                          <option>Певцы и музыканты</option>
                          <option>Актеры</option>
                          <option>Онлайн-бизнес</option>
                          <option>Оффлайн-бизнес</option>
                        </select>
                      </div>
                      <div><Label>Ссылка на проект</Label><Input value={pLink} onChange={(e)=>setPLink(e.target.value)} placeholder="https://…"/></div>
                      <div><Label>Ссылка на файлы</Label><Input value={pFiles} onChange={(e)=>setPFiles(e.target.value)} placeholder="Google Drive/Dropbox"/></div>
                    </CardContent>
                    <CardFooter>
                      <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={submitProject}>Отправить на модерацию</Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}

            {tab==='settings' && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Настройки</CardTitle>
                  <CardDescription>Личные данные и контакты</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div><Label>Имя</Label><Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Иван Петров"/></div>
                  <div><Label>Адрес страницы</Label><Input value={site} onChange={(e)=>setSite(e.target.value)} placeholder="https://example.com/"/></div>
                  <div>
                    <Label>Пол</Label>
                    <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                      <option>Не выбрано</option>
                      <option>Мужской</option>
                      <option>Женский</option>
                    </select>
                  </div>
                  <div><Label>Дата рождения</Label><Input value={birthday} onChange={(e)=>setBirthday(e.target.value)} placeholder="ДД.ММ.ГГГГ"/></div>
                  <div><Label>Контактный телефон</Label><Input value={tel} onChange={(e)=>setTel(e.target.value)} placeholder="+7…"/></div>
                  <div><Label>Город</Label><Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Начните вводить"/></div>
                  <div>
                    <Label>Страна</Label>
                    <select value={country} onChange={(e)=>setCountry(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                      <option>Не выбрано</option>
                      <option>Россия</option>
                      <option>Казахстан</option>
                      <option>Беларусь</option>
                      <option>Другая</option>
                    </select>
                  </div>
                  <div className="md:col-span-2"><Label>О себе</Label><Textarea rows={6} value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Расскажите о себе в двух предложениях"/></div>
                </CardContent>
                <CardFooter>
                  <div className="ml-auto flex items-center gap-2">
                    {avatarUrl && <Button variant="ghost" className="text-red-600" onClick={()=>setAvatarUrl(null)}>Удалить фото</Button>}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                      <Upload className="h-4 w-4"/> Фото
                      <input type="file" className="hidden" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; const u=URL.createObjectURL(f); setAvatarUrl(u); }} />
                    </label>
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Сохранить изменения</Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t bg-white" id="docs-end">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <span className="font-semibold">Платформа талантов</span>
              <p className="text-sm text-muted-foreground">Народный сезон: без донатов и жюри. Прозрачные правила.</p>
            </div>
            <div>
              <div className="mb-2 font-semibold">Документы</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a className="underline" href="#">Публичная оферта</a></li>
                <li><a className="underline" href="#">Положение о конкурсе</a></li>
                <li><a className="underline" href="#">Правила голосования и модерации</a></li>
                <li><a className="underline" href="#">Пользовательское соглашение</a></li>
                <li><a className="underline" href="#">Политика конфиденциальности и ПДн</a></li>
              </ul>
            </div>
            <div></div>
            <div></div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Платформа талантов</span>
            <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-indigo-600" /> Прозрачность • 24h cooldown</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =====================================================
   Wide Works Carousel (full width) + ListColumn (4 lists)
===================================================== */
function WideWorksCarousel({ items, onProjectClick }: { items: Array<{ id:number; cover?: string; title:string; summary?: string; rank?: number; category: string }>; onProjectClick: (discipline: string) => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[idx] || items[0];
  const go = (i:number) => setIdx((i + items.length) % items.length);
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="grid gap-6 p-4 md:grid-cols-2 md:p-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 cursor-pointer" onClick={() => onProjectClick(cur.category)}>
          {cur?.cover ? (
            <img src={cur.cover} alt={cur.title} className="h-full w-full object-cover"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Видео/фото проекта</div>
          )}
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{cur.category}</div>
          {typeof cur.rank === 'number' && (
            <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white">ТОП #{cur.rank}</div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Проект</Badge>
            <span className="text-xs text-muted-foreground">карусель по работам</span>
          </div>
          <h3 className="text-xl font-semibold leading-snug cursor-pointer" onClick={() => onProjectClick(cur.category)}>{cur.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{cur.summary || 'Краткая информация о проекте. Если проект текстовый — выводим ключевые тезисы/аннотацию.'}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-1">
              {items.map((_, i) => (
                <button key={i} aria-label={`dot-${i}`} onClick={() => go(i)} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-indigo-600' : 'bg-muted'}`}/>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => go(idx - 1)}>Назад</Button>
              <Button variant="outline" size="sm" onClick={() => go(idx + 1)}>Вперёд</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ListColumn({ title, items, onMore }: { title: string; items: Array<{ id:number; title:string; subtitle?:string; tag?:string }>; onMore: () => void }) {
  return (
    <Card className="rounded-2xl h-full flex flex-col">
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex-1">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-md bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold leading-5 text-white">Фото</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{it.title}</div>
                <div className="text-xs text-muted-foreground truncate" title={it.subtitle || 'Краткая информация. Трек/роль.'}>{it.subtitle || 'Краткая информация. Трек/роль.'}</div>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[11px] px-2 py-0.5 leading-5 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{it.tag || 'Трек'}</Badge>
          </div>
        ))}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full" onClick={onMore}>Перейти</Button>
      </CardFooter>
    </Card>
  );
}

/* =====================================================
   Quick Navigator (collapsible) — only 4 mini-pages
===================================================== */
function QuickNavigator({ openPage, openCategory }: { openPage: (key: string) => void; openCategory: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const LinkBtn = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={() => { onClick(); onClose(); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/70">
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-2">
      {/* Фиксированная кнопка у левого края экрана */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-2 top-[76px] z-[62] flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1 text-sm shadow-sm hover:bg-white"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="side-nav"
        >
          <Menu className="h-4 w-4"/> Навигация
        </button>
      )}

      {/* Левый сайдбар */}
      {open && (
        <>
          {/* Оверлей */}
          <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose} />

          {/* Панель */}
          <aside
            id="side-nav"
            role="dialog"
            aria-modal="true"
            className="fixed left-0 top-0 z-[61] h-full w-[86%] max-w-[320px] translate-x-0 overflow-y-auto border-r bg-white shadow-xl outline-none md:w-[360px]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white/90 px-4 py-3">
              <span className="text-sm font-semibold">Навигация</span>
              <button onClick={onClose} className="rounded-full border px-2 py-1 text-xs hover:bg-muted">Закрыть</button>
            </div>

            <div className="px-3 py-3">
              {/* Секции сайта */}
              <div>
                <div className="px-2 pb-1 text-xs uppercase text-muted-foreground">Разделы</div>
                <LinkBtn onClick={() => scrollToId("how")}>Как это работает</LinkBtn>
                <LinkBtn onClick={() => scrollToId("forwhom")}>Для кого?</LinkBtn>
                <LinkBtn onClick={() => scrollToId("roles")}>Роли</LinkBtn>
                <LinkBtn onClick={() => scrollToId("pricing")}>Тарифы</LinkBtn>
                <LinkBtn onClick={() => scrollToId("tracks")}>Треки и брифы</LinkBtn>
                <LinkBtn onClick={() => scrollToId("showcase")}>Витрина/Участники</LinkBtn>
                <LinkBtn onClick={() => scrollToId("prizes")}>Призы</LinkBtn>
                <LinkBtn onClick={() => scrollToId("faq")}>FAQ</LinkBtn>
              </div>

              {/* Отдельные страницы */}
              <div className="mt-4">
                <div className="px-2 pb-1 text-xs uppercase text-muted-foreground">Отдельные страницы</div>
                <LinkBtn onClick={() => openPage("top")}>Топ участники</LinkBtn>
                <LinkBtn onClick={() => openPage("docs")}>Документы</LinkBtn>
                <LinkBtn onClick={() => openPage("partners")}>Партнёры</LinkBtn>
              </div>

              {/* Категории */}
              <div className="mt-4">
                <div className="px-2 pb-1 text-xs uppercase text-muted-foreground">Категории</div>
                <div className="rounded-xl border">
                  <div className="px-3 pt-2 text-xs uppercase text-muted-foreground">Шоу‑бизнес</div>
                  <LinkBtn onClick={() => openCategory("show_singers")}>
                    <div className="flex items-center justify-between">Певцы и музыканты <ChevronRight className="h-3.5 w-3.5"/></div>
                  </LinkBtn>
                  <LinkBtn onClick={() => openCategory("show_actors")}>
                    <div className="flex items-center justify-between">Актеры <ChevronRight className="h-3.5 w-3.5"/></div>
                  </LinkBtn>
                  <div className="px-3 pt-2 text-xs uppercase text-muted-foreground">Предприниматели</div>
                  <LinkBtn onClick={() => openCategory("biz_online")}>
                    <div className="flex items-center justify-between">Онлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></div>
                  </LinkBtn>
                  <LinkBtn onClick={() => openCategory("biz_offline")}>
                    <div className="flex items-center justify-between">Оффлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></div>
                  </LinkBtn>
                </div>
              </div>

              <div className="h-6"/>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function SmallPage({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-violet-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-2 group">
            <Star className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition" />
            <span className="font-semibold group-hover:text-indigo-700">Платформа талантов</span>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-3 text-3xl font-bold">{title}</h1>
        <div className="prose max-w-none text-muted-foreground">{children}</div>
      </main>
    </div>
  );
}

function CategoryPage({ keyId, onBack, onOpenBrief }: { keyId: string; onBack: () => void; onOpenBrief: (title: string) => void }) {
  const map: Record<string, { title: string; desc: string; brief: string }>= {
    show_singers: { title: "Шоу‑бизнес — Певцы и музыканты", desc: "Видео 15–60 сек + портфолио. Оцениваем подачу, оригинальность, потенциал.", brief: "Шоу‑бизнес" },
    show_actors: { title: "Шоу‑бизнес — Актеры", desc: "Клип/самопробы 15–60 сек, возможны ссылки на работы.", brief: "Шоу‑бизнес" },
    biz_online: { title: "Предприниматели — Онлайн‑бизнес", desc: "Стартап/цифровой продукт, лендинг/MVP, краткая юнит‑экономика.", brief: "Бизнес" },
    biz_offline: { title: "Предприниматели — Оффлайн‑бизнес", desc: "Формат оффлайн, презентация и расчёты спроса/unit‑экономики.", brief: "Бизнес" },
  };
  const data = map[keyId];
  return (
    <SmallPage title={data?.title || "Категория"} onBack={onBack}>
      <p className="mb-4">{data?.desc}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onOpenBrief(data?.brief || "")}>Смотреть бриф</Button>
        <Button variant="outline" onClick={onBack}>На главную</Button>
      </div>
    </SmallPage>
  );
}

/* =====================================================
   HOME (Landing) — with quick navigator & limited mini-pages
===================================================== */
export default function App() {
  const [route, setRoute] = useState<'home' | 'account' | 'page' | 'category'>('home');
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [categoryKey, setCategoryKey] = useState<string | null>(null);

  const [isAuthed, setAuthed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [plan, setPlan] = useState<"community" | "participant">("community");
  const [openAuth, setOpenAuth] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [openBrief, setOpenBrief] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [topDiscipline, setTopDiscipline] = useState<string>('Вокалисты');

  // mock progress
  const peopleProgress = 52;

  // demo countdown (90 days)
  const [secondsLeft, setSecondsLeft] = useState(90 * 24 * 60 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d}д ${pad(h)}ч ${pad(m)}м ${pad(sec)}с`;
  };

  // Tiny runtime checks (dev only)
  useEffect(() => {
    try {
      console.assert(fmt(0).includes('0д'), 'fmt(0) baseline');
      console.assert(fmt(3661).includes('01ч'), 'fmt hours pad');
      const len = 5; const next = ((-1 + len) % len + len) % len; console.assert(next === 4, 'carousel index wrap');
    } catch {}
  }, []);

  const goAccount = () => setRoute('account');
  const goHome = () => setRoute('home');

  const openPage = (key: string) => { setPageKey(key); setRoute('page'); };
  const openTop = (disc: string) => { setTopDiscipline(disc); setPageKey('top'); setRoute('page'); };
  const openCategory = (key: string) => { setCategoryKey(key); setRoute('category'); };

  // participants dropdown stable hover/click
  const [navPartOpen, setNavPartOpen] = useState(false);
  const navPartRef = useRef<HTMLDivElement | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const openNavPart = () => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); setNavPartOpen(true); };
  const closeNavPart = () => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setNavPartOpen(false), 160); };
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!navPartRef.current) return;
      if (!navPartRef.current.contains(e.target as Node)) setNavPartOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  // showcase demo data
  const works = Array.from({ length: 8 }).map((_, i) => ({ id: i + 1, title: `Проект #${i + 1}`, subtitle: i % 2 ? "Шоу‑бизнес" : "Бизнес" }));
  const authors = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, title: `Автор #${i + 1}`, subtitle: i % 2 ? 'Шоу‑бизнес' : 'Бизнес', tag: i % 3 === 0 ? 'Музыка' : i % 3 === 1 ? 'Актёр' : 'Стартап' }));
  const expertsList = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, title: `Эксперт #${i + 1}`, subtitle: i % 2 ? 'Бизнес-эксперт' : 'Креативная', tag: i % 2 ? 'VC' : 'PR' }));
  const candidates = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, title: `Кандидат #${i + 1}`, subtitle: 'В команду проекта', tag: i % 2 ? 'SMM' : 'Продюсер' }));
  const investorsList = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, title: `Инвестор #${i + 1}`, subtitle: i % 2 ? 'Angel' : 'VC', tag: i % 2 ? 'Angel' : 'VC' }));

  if (route === 'account') {
    return (
      <>
        <AccountPage
          plan={plan}
          setPlan={(p)=>{ setPlan(p); }}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          onUpgradeClick={()=> setOpenPayment(true)}
          goHome={goHome}
          fullName={fullName}
          setFullName={setFullName}
          projects={projects}
          setProjects={setProjects}
        />
        <PaymentModal open={openPayment} onOpenChange={setOpenPayment} onSuccess={()=>{ setPlan('participant'); setOpenPayment(false); }} />
      </>
    );
  }

  if (route === 'category' && categoryKey) {
    return (
      <>
        <CategoryPage keyId={categoryKey} onBack={goHome} onOpenBrief={(t)=> setOpenBrief(t)} />
        <BriefModal open={!!openBrief} onClose={() => setOpenBrief(null)} track={openBrief} />
      </>
    );
  }

  if (route === 'page' && pageKey) {
    const titles: Record<string, string> = {
      tariffs: 'Тарифы',
      top: 'Топ участники',
      docs: 'Документы',
      partners: 'Партнёры',
      authors: 'Авторы — полный список',
      experts: 'Эксперты — полный список',
      candidates: 'Кандидаты — полный список',
      investors: 'Инвесторы — полный список',
    };
    return (
      <SmallPage title={titles[pageKey] || 'Страница'} onBack={goHome}>
        {pageKey === 'tariffs' && (
          <div>
            <p>Доступ: «Сообщество» — 1 000 ₽/мес (подписка), «Участник» — 2 500 ₽/сезон (1 проект, максимум 2; второй +5 000 ₽). Оплата невозвратная.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="rounded-2xl border-indigo-200"><CardHeader><CardTitle>Сообщество</CardTitle><CardDescription>Подписка</CardDescription></CardHeader><CardContent className="text-sm space-y-1"><div className="flex items-center gap-2"><Check className="h-4 w-4"/>3 голоса в каждой подкатегории</div><div className="flex items-center gap-2"><Check className="h-4 w-4"/>Треды, комментарии</div></CardContent></Card>
              <Card className="rounded-2xl border-violet-200"><CardHeader><CardTitle>Участник</CardTitle><CardDescription>Разовый сезон</CardDescription></CardHeader><CardContent className="text-sm space-y-1"><div className="flex items-center gap-2"><Check className="h-4 w-4"/>Право подать проект</div><div className="flex items-center gap-2"><Check className="h-4 w-4"/>Публикация на витрине</div></CardContent></Card>
            </div>
          </div>
        )}
        {pageKey === 'top' && (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">Топ участников по дисциплинам. Выберите вкладку.</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {['Вокалисты','Музыканты','Актеры','Предприниматели IT','Оффлайн проекты'].map((t)=> (
                <button key={t} onClick={()=> setTopDiscipline(t)} className={`rounded-full border px-3 py-1 text-sm ${topDiscipline===t ? 'bg-indigo-600 text-white' : 'hover:bg-muted'}`}>{t}</button>
              ))}
            </div>
            <div className="grid gap-2 text-sm">
              {Array.from({length:12}).map((_,i)=> (
                <div key={i} className="rounded-xl border p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{topDiscipline}: Проект #{i+1}</div>
                    <div className="text-xs text-muted-foreground">Очки: {100 - i*3} • Голоса: {300 - i*7}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">ТОП #{i+1}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {pageKey === 'docs' && (
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Публичная оферта</li>
            <li>Положение о конкурсе</li>
            <li>Правила голосования и модерации</li>
            <li>Пользовательское соглашение</li>
            <li>Политика конфиденциальности и ПДн</li>
          </ul>
        )}
        {pageKey === 'partners' && (
          <div>
            <p>Партнёрские пакеты: медиа, продакшн, акселерация, инфраструктура. Напишите нам — обсудим интеграцию.</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <Card className="rounded-2xl"><CardHeader><CardTitle>Медиа‑партнёры</CardTitle></CardHeader><CardContent className="text-sm">Сеть каналов и площадок для охватов витрины и финала.</CardContent></Card>
              <Card className="rounded-2xl"><CardHeader><CardTitle>Продакшн</CardTitle></CardHeader><CardContent className="text-sm">Студии записи, видеопродакшн, сцены.</CardContent></Card>
            </div>
          </div>
        )}
        {['authors','experts','candidates','investors'].includes(pageKey) && (
          <div>
            <p className="text-sm text-muted-foreground">Полный список — демонстрационные данные. Здесь будет пагинация и фильтры.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(pageKey === 'authors' ? authors : pageKey === 'experts' ? expertsList : pageKey === 'candidates' ? candidates : investorsList).map((it)=> (
                <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-md bg-orange-500/90 px-2 py-0.5 text-xs font-medium text-white">Фото</span>
                    <div>
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-xs text-muted-foreground">{it.subtitle}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis text-[11px] px-2 py-0.5">{it.tag || 'Трек'}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </SmallPage>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-white" id="home">
      <style>{`
        @keyframes scrollUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .animate-[scrollUp_14s_linear_infinite] { animation: scrollUp 14s linear infinite; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
            <Star className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition" />
            <span className="font-semibold group-hover:text-indigo-700">Платформа талантов</span>
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            <button onClick={() => scrollToId('how')} className="text-sm text-muted-foreground hover:text-foreground">Как это работает</button>
            <button onClick={() => scrollToId('forwhom')} className="text-sm text-muted-foreground hover:text-foreground">Для кого?</button>
            <button onClick={() => scrollToId('roles')} className="text-sm text-muted-foreground hover:text-foreground">Роли</button>
            <button onClick={() => scrollToId('pricing')} className="text-sm text-muted-foreground hover:text-foreground">Тарифы</button>
            <button onClick={() => scrollToId('tracks')} className="text-sm text-muted-foreground hover:text-foreground">Треки и брифы</button>
            <div ref={navPartRef} className="relative" onMouseEnter={openNavPart} onMouseLeave={closeNavPart}>
              <button onClick={() => setNavPartOpen(v=>!v)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                Участники <ChevronDown className={`h-3.5 w-3.5 transition-transform ${navPartOpen ? 'rotate-180' : ''}`}/>
              </button>
              {navPartOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white p-3 shadow-xl will-change-transform" onMouseEnter={openNavPart} onMouseLeave={closeNavPart}>
                  <div className="text-xs uppercase text-muted-foreground">Шоу‑бизнес</div>
                  <div className="mt-1 grid gap-1">
                    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('show_singers')}>Певцы и музыканты <ChevronRight className="h-3.5 w-3.5"/></button>
                    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('show_actors')}>Актеры <ChevronRight className="h-3.5 w-3.5"/></button>
                  </div>
                  <div className="mt-3 text-xs uppercase text-muted-foreground">Предприниматели</div>
                  <div className="mt-1 grid gap-1">
                    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('biz_online')}>Онлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></button>
                    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => openCategory('biz_offline')}>Оффлайн‑бизнес <ChevronRight className="h-3.5 w-3.5"/></button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => scrollToId('showcase')} className="text-sm text-muted-foreground hover:text-foreground">Витрина/Участники</button>
            <button onClick={() => scrollToId('prizes')} className="text-sm text-muted-foreground hover:text-foreground">Призы</button>
            <button onClick={() => scrollToId('faq')} className="text-sm text-muted-foreground hover:text-foreground">FAQ</button>
          </nav>
          <div className="flex items-center gap-3">
            {!isAuthed && (
              <Button variant="ghost" className="hidden md:inline-flex text-indigo-700 hover:text-indigo-900" onClick={() => setOpenAuth(true)}>
                Войти
              </Button>
            )}
            {isAuthed && plan === "participant" && (
              <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                Подать проект
              </Button>
            )}
            <button
              onClick={() => (isAuthed ? goAccount() : setOpenAuth(true))}
              className="h-10 w-10 overflow-hidden rounded-full border bg-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Аккаунт"
              title="Аккаунт"
            >
              {avatarUrl ? (
                <img alt="avatar" src={avatarUrl} className="h-full w-full object-cover"/>
              ) : (
                <div className="flex h-full w-full items-center justify-center"><User className="h-5 w-5 text-muted-foreground"/></div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK NAV (collapsible) */}
      <QuickNavigator openPage={openPage} openCategory={openCategory} />

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_10%_10%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(50%_35%_at_90%_20%,rgba(139,92,246,0.2),transparent_60%)]"/>
        <div className="mx-auto max-w-6xl px-4 pt-8">
          {/* синяя капсула */}
          <div className="rounded-[28px] bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-8 py-14 text-white shadow-[0_20px_60px_rgba(76,29,149,0.35)] ring-1 ring-white/10">
            <div className="text-center text-xl md:text-2xl opacity-90">Видео или картинка</div>
            <h1 className="mx-auto mt-4 max-w-4xl text-center text-2xl md:text-4xl font-semibold leading-snug">
              Народный сезон талантов: честные голоса, прозрачные правила
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-center text-base md:text-lg text-white/90">
              Без донатов. 3 голоса у каждого. Вы голосуете — мы исполняем.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={() => (isAuthed ? goAccount() : setOpenAuth(true))} className="pointer-events-auto rounded-full bg-white/95 px-6 text-indigo-700 hover:bg-white">
                Присоединиться
              </Button>
              <Button onClick={() => scrollToId('tracks')} variant="secondary" className="pointer-events-auto rounded-full border-white/60 bg-transparent text-white hover:bg-white/10">
                Смотреть брифы
              </Button>
            </div>
          </div>

          {/* две колонки под капсулой */}
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {/* левая текстовая колонка */}
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p><b>Без донатов и платных голосов</b> | <b>3 голоса у каждого</b> | <b>Призы: денежный эквивалент*</b></p>
              <p className="mt-3">Доступ к сообществу и участию формирует общий фонд сезона. Членство даёт доступ к комьюнити, витрине и онлайн* эфиру/итогам. Сезон по 3 месяца.</p>
              <p className="mt-3">Финальная фаза — выявление победителей с награждением стартует через <b>30 дней</b> после достижения порога: <b>25 000 участников</b>.</p>
              <p className="mt-3 text-xs">*Для детских категорий — только сервисные призы (без денежных выплат)</p>
            </div>

            {/* правая колонка с прогрессом и таймером */}
            <div>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Прогресс порога запуска сезона</CardTitle>
                  <CardDescription>Участников в категориях</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5"/>Индикатор должен стать зелёным</span>
                      <span className="tabular-nums">{peopleProgress}%</span>
                    </div>
                    <Progress value={peopleProgress} />
                  </div>
                  <p className="text-xs text-muted-foreground">(Индикаторы должны стать зелёными. Финал начнётся через 30 дней после достижения порога)</p>
                  <div className="pt-1 text-sm">Либо так: Собрано <b>136</b> из <b>180</b> участников</div>
                  <div className="pt-2 text-sm">До финала: <b className="tabular-nums">{fmt(secondsLeft)}</b></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Как это работает</h2>
            <p className="mx-auto mt-3 max-w-3xl text-base md:text-lg italic text-foreground/80">
              Никаких жюри и платных голосов. Все, кто оплатил доступ, получают по 3 голоса в каждой подкатегории.
            </p>
            <p className="mx-auto mt-1 max-w-3xl text-sm text-muted-foreground">
              Счёт ведётся на платформе <span className="whitespace-nowrap">(бот + Telegram WebApp + сайт — максимальная защита от накрутки)</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm tracking-wide text-foreground/80">
              <span className="font-medium">Заявка</span> → витрина → открытое голосование → финал и призы
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              {n:1, t:'Оплачиваете доступ', d:'Сообщество 1 000 ₽/мес или Участник 2 500 ₽/сезон.'},
              {n:2, t:'Получаете 3 голоса', d:'В каждой подкатегории. Голос — спустя 24 часа после оплаты.'},
              {n:3, t:'Подаёте работу', d:'Участники отправляют проект в свою категорию.'},
              {n:4, t:'Витрина и тред', d:'Проекты появляются на витрине и в Telegram‑тредах.'},
              {n:5, t:'Открытое голосование', d:'Все участники/сообщество голосуют. Без донатов.'},
              {n:6, t:'Финал и призы', d:'После порога и финала — денежные/сервисные призы.'},
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-gradient-to-b from-indigo-50 to-white p-4 shadow-sm hover:shadow-md transition">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{s.n}</span>
                  <span className="text-sm font-semibold">{s.t}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHOM */}
      <section id="forwhom" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Для кого?</h2>
          <div className="grid gap-8 md:grid-cols-2 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Для кого платформа через блок «Участник»</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><b>Артисты (певцы)</b>: видео выступления или портфолио, участие в витрине, 3 голоса/подкатегория.</li>
                <li><b>Актеры (самопробы)</b>: видеозаявки и портфолио, участие в витрине и конкурсном отборе.</li>
                <li><b>Предприниматели — IT</b>: лендинг/MVP/идея стартапа, голосование сообщества и экспертов.</li>
                <li><b>Стартапы и проекты</b>: преза/лендинг, треды, модерация ≤24ч, сервисная поддержка.</li>
                <li><b>Детские проекты</b>: видео/портфолио, только сервисные призы (без денежных выплат).</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Для кого ещё роль «Сообщество»</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><b>Формат участия без публикации</b> — голос и обсуждение проектов, 3 голоса/подкатегория.</li>
                <li><b>Актёры, музыканты, лайвы</b> — поддержка коллег и обратная связь в комментариях.</li>
                <li><b>Бизнес‑сообщество</b>: эксперты и инвесторы для голосования и обратной связи.</li>
                <li><b>Наставники и менторы</b>: обратная связь, поддержка проектов, обсуждение в тредах.</li>
                <li><b>Инвесторы</b>: знакомство со стартапами, возможность поддержки и акселерации.</li>
                <li><b>Любой зритель</b>, кто хочет быть частью процесса, голосовать и видеть результаты.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold">Роли</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">Сообщество, Участник, Автор, Эксперт, Инвестор, Модератор, Администратор.</p>
        </div>
      </section>

      {/* PRICING (ТАРИФЫ) */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Тарифы</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">Выберите формат участия: подписка «Сообщество» или разовый сезон «Участник». Оплата невозвратная.</p>
          </div>

          {/* Сначала — Участник, затем — Сообщество */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Участник (первым) */}
            <Card className="rounded-2xl border-indigo-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Участник</CardTitle>
                  <Badge className="bg-indigo-600 text-white">Разовый</Badge>
                </div>
                <div className="mt-1 text-3xl font-bold">2 500 ₽<span className="text-base font-medium text-muted-foreground">/сезон</span></div>
                <CardDescription>Право подать проект на витрину. Максимум 2 проекта на аккаунт.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Check className="h-4 w-4"/>1 проект включён (2‑й +5 000 ₽)</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Модерация ≤ 24 ч (раб. дни)</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Публикация на витрине и в TG‑каналах</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Обратная связь из тредов/экспертов</div>
              </CardContent>
              <CardFooter>
                {isAuthed ? (
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setOpenPayment(true)}>
                    Обновить до «Участника»
                  </Button>
                ) : (
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setOpenAuth(true)}>
                    Стать участником
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Сообщество (вторым) */}
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Сообщество</CardTitle>
                    <Badge variant="secondary">Подписка</Badge>
                  </div>
                  <div className="mt-1 text-3xl font-bold">1 000 ₽<span className="text-base font-medium text-muted-foreground">/мес</span></div>
                  <CardDescription>Доступ к голосованию, тредам, витрине, итогам сезона.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4"/>3 голоса в каждой подкатегории</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Комментирование и участие в тредах</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Telegram WebApp голосование</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4"/>Прозрачные итоги, без платных голосов</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => (isAuthed ? goAccount() : setOpenAuth(true))}>Перейти в ЛК</Button>
                </CardFooter>
              </Card>

              {/* Синяя таблица ролей: переименована в «Сообщество» и расположена под тарифом Сообщество */}
              <div className="rounded-2xl bg-indigo-600/95 p-4 text-white shadow-lg ring-1 ring-black/5">
                <div className="mx-auto max-w-5xl">
                  <h3 className="text-center text-xl font-semibold">Сообщество</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-5">
                    <div className="rounded-xl bg-indigo-700/50 p-3 text-sm">
                      <div className="mb-1 font-semibold">Голосующий</div>
                      <p className="text-white/90">Может голосовать не более 1 раза в каждой подкатегории и не более чем в 3 категориях за сезон. Доступ к обсуждениям и итогам.</p>
                    </div>
                    <div className="rounded-xl bg-indigo-700/50 p-3 text-sm">
                      <div className="mb-1 font-semibold">Автор</div>
                      <p className="text-white/90">Голосует как сообщество и может предлагать наработки участнику (трек/музыка/идея), участвовать в коллаборациях.</p>
                    </div>
                    <div className="rounded-xl bg-indigo-700/50 p-3 text-sm">
                      <div className="mb-1 font-semibold">Эксперт</div>
                      <p className="text-white/90">Даёт рекомендации и обратную связь в тредах, участвует в специальных отборах/шорт-листах. Может голосовать как сообщество.</p>
                    </div>
                    <div className="rounded-xl bg-indigo-700/50 p-3 text-sm">
                      <div className="mb-1 font-semibold">Кандидат</div>
                      <p className="text-white/90">Ищет позицию в командах (SMM, продюсер, дизайнер и др.), подаёт заявки авторам/участникам, получает отзывы.</p>
                    </div>
                    <div className="rounded-xl bg-indigo-700/50 p-3 text-sm">
                      <div className="mb-1 font-semibold">Инвестор</div>
                      <p className="text-white/90">Знакомится со стартапами и авторами, отслеживает динамику голосов и получает доступ к контактам для поддержки.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" className="bg-gradient-to-b from-indigo-50 via-white to-violet-50">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Витрина</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">Сверху — крупная карусель работ. Ниже — четыре списка с быстрым просмотром и кнопкой «Перейти».</p>
          </div>

          {/* Full‑width works carousel */}
          <WideWorksCarousel
            items={works.map((w, i) => ({
              id: w.id,
              title: `Проект #${w.id}`,
              summary: w.subtitle === 'Бизнес' ? 'Идея/лендинг/MVP, краткая выжимка по метрикам.' : 'Видео/портфолио: вокал, музыка или актёрская работа.',
              rank: (i % 4) + 1,
              category: ['Вокалисты','Музыканты','Актеры','Предприниматели IT','Оффлайн проекты'][i % 5],
            }))}
            onProjectClick={(disc) => openTop(disc)}
          />

          {/* Four lists below */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <ListColumn title="Авторы" items={authors.slice(0,4)} onMore={() => openPage('authors')} />
            <ListColumn title="Эксперты" items={expertsList.slice(0,4)} onMore={() => openPage('experts')} />
            <ListColumn title="Кандидаты" items={candidates.slice(0,4)} onMore={() => openPage('candidates')} />
            <ListColumn title="Инвесторы" items={investorsList.slice(0,4)} onMore={() => openPage('investors')} />
          </div>
        </div>
      </section>

      {/* TRACKS / BRIEFS */}
      <section id="tracks" className="bg-gradient-to-b from-white via-indigo-50 to-violet-50">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Категории и брифы</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">Две основные категории с подкатегориями. Брифы открываются по кнопке.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-2xl border-2">
              <CardHeader>
                <CardTitle className="text-lg">Шоу‑бизнес</CardTitle>
                <CardDescription>Певцы и музыканты • Актеры</CardDescription>
              </CardHeader>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setOpenBrief("Шоу‑бизнес")}>Смотреть бриф</Button>
                  <button onClick={() => openCategory('show_singers')} className="text-sm underline decoration-dotted">Певцы и музыканты</button>
                  <button onClick={() => openCategory('show_actors')} className="text-sm underline decoration-dotted">Актеры</button>
                </div>
              </CardFooter>
            </Card>
            <Card className="rounded-2xl border-2">
              <CardHeader>
                <CardTitle className="text-lg">Бизнес</CardTitle>
                <CardDescription>Онлайн‑бизнес • Оффлайн‑бизнес</CardDescription>
              </CardHeader>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setOpenBrief("Бизнес")}>Смотреть бриф</Button>
                  <button onClick={() => openCategory('biz_online')} className="text-sm underline decoration-dotted">Онлайн‑бизнес</button>
                  <button onClick={() => openCategory('biz_offline')} className="text-sm underline decoration-dotted">Оффлайн‑бизнес</button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section id="prizes" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold">Призы</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">Победитель выбирает: денежный приз или производственный эквивалент (запись/ротация; роль/производство; акселерация/методподдержка). Детские треки — только сервисные призы.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            <AccordionItem value="item-1">
              <AccordionTrigger>Это краудфандинг?</AccordionTrigger>
              <AccordionContent>Нет. Оплата — доступ к сезону (сообщество/участник), формирующий общий фонд. Итоги определяет голосование. Платных голосов нет.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Сколько и где голосую?</AccordionTrigger>
              <AccordionContent>3 голоса в каждой подкатегории у каждого платящего. Голосуем на сайте и через Telegram WebApp из треда.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Почему голос активируется через 24 часа?</AccordionTrigger>
              <AccordionContent>Антинакрутка: проверка платежа и устройства. При аномалиях голос временно замораживается до аудита.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white" id="docs-end">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 font-semibold group">
                <Star className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition" /> <span className="group-hover:text-indigo-700">Платформа талантов</span>
              </button>
              <p className="text-sm text-muted-foreground">Народный сезон: без донатов и жюри. 3 голоса у каждого. Прозрачные правила.</p>
            </div>
            <div>
              <div className="mb-2 font-semibold">Документы</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a className="underline" href="#">Публичная оферта</a></li>
                <li><a className="underline" href="#">Положение о конкурсе</a></li>
                <li><a className="underline" href="#">Правила голосования и модерации</a></li>
                <li><a className="underline" href="#">Пользовательское соглашение</a></li>
                <li><a className="underline" href="#">Политика конфиденциальности и ПДн</a></li>
              </ul>
            </div>
            <div></div>
            <div></div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Платформа талантов</span>
            <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-indigo-600" /> Прозрачность • 24h cooldown</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthDialog open={openAuth} onOpenChange={setOpenAuth} onSuccess={(res)=>{ setAuthed(true); setPlan(res.plan); setFullName(res.fullName); }} />
      <PaymentModal open={openPayment} onOpenChange={setOpenPayment} onSuccess={()=>{ setPlan('participant'); setOpenPayment(false); goAccount(); }} />
      <BriefModal open={!!openBrief} onClose={()=>setOpenBrief(null)} track={openBrief} />
    </div>
  );
}
