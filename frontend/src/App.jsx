import { useEffect, useState } from 'react';
import logoUrl from './assets/wifak-sport-logo.jpg';
import blackBloodImg from './assets/blackblood-pre-w.webp';
import isoWheyZeroBlackImg from './assets/iso-whey-zero-black.webp';
import wheyZeroBlueImg from './assets/whey-zero-blue.webp';
import creatineImg from './assets/creatine.webp';
import multivitaminesWomenImg from './assets/multivitamines-for-women.webp';
import oneADayImg from './assets/MULTIVITAMINES.png';
import ghHormoneImg from './assets/gh-hormone.webp';
import triboosterImg from './assets/Tribooster.webp';
import muscleMassImg from './assets/muscle-mass.webp';
import bcaa6000Img from './assets/bcaa-6000.webp';
import glutaminesImg from './assets/glutamines.webp';
import packImg from './assets/pack.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function makeIcon(name) {
  const paths = {
    activity: 'M4 12h4l2-7 4 14 2-7h4',
    chart: 'M5 19V9m7 10V5m7 14v-7',
    bell: 'M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4L6 17Zm6 3a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z',
    calendar: 'M5 7h14M8 4v4m8-4v4M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z',
    down: 'M7 9l5 5 5-5',
    right: 'M9 6l6 6-6 6',
    crown: 'M5 17h14l1-9-5 3-3-6-3 6-5-3 1 9Zm1 3h12',
    gym: 'M4 10v4m3-6v8m10-8v8m3-6v4M7 12h10',
    file: 'M7 3h7l4 4v14H7V3Zm7 0v5h5M9 16h6m-3-3v6',
    heart: 'M12 20s-7-4.3-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.7-7 10-7 10Z',
    lock: 'M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Z',
    logout: 'M10 6H5v12h5m4-9 3 3-3 3m-6-3h9',
    chat: 'M5 6h14v10H9l-4 4V6Z',
    search: 'M10 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5-2 5 5',
    shield: 'M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10Zm-3-10 2 2 4-4',
    bag: 'M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0',
    spark: 'M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z',
    star: 'M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L12 3Z',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M14 19a5 5 0 0 1 7 0',
    wallet: 'M4 7h15v12H4V7Zm2-3h11v3H6V4Zm10 8h3v3h-3v-3Z',
    contract: 'M7 3h10v18H7V3Zm3 5h4m-4 4h4m-4 4h2',
  };
  return function Icon({ size = 18 }) {
    return (
      <svg className="local-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d={paths[name] || paths.spark} />
      </svg>
    );
  };
}

const Activity = makeIcon('activity');
const BarChart3 = makeIcon('chart');
const Bell = makeIcon('bell');
const CalendarDays = makeIcon('calendar');
const ChevronDown = makeIcon('down');
const ChevronRight = makeIcon('right');
const Crown = makeIcon('crown');
const Dumbbell = makeIcon('gym');
const FileDown = makeIcon('file');
const Heart = makeIcon('heart');
const Lock = makeIcon('lock');
const LogOut = makeIcon('logout');
const MessageCircle = makeIcon('chat');
const Search = makeIcon('search');
const ShieldCheck = makeIcon('shield');
const ShoppingBag = makeIcon('bag');
const Sparkles = makeIcon('spark');
const Star = makeIcon('star');
const Users = makeIcon('users');
const Wallet = makeIcon('wallet');
const ContractIcon = makeIcon('contract');

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('wifak_access');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || 'Request failed');
    error.response = { data, status: response.status };
    throw error;
  }
  return { data };
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
};

const heroSlides = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1800&q=80',
];

const roles = [
  { id: 'coach', label: 'Coach', icon: Dumbbell, hint: 'Cours, clients, primes' },
  { id: 'admin', label: 'Admin', icon: Crown, hint: 'Analytics, revenus, gestion' },
  { id: 'client', label: 'Client', icon: Users, hint: 'Offres, QR code, boutique' },
  { id: 'responsable', label: 'Responsable', icon: ShieldCheck, hint: 'Planning, acces, membres' },
];

const offers = [
  { id: 'basic', name: 'Basic', price: 250, perks: ['Acces salle', 'Cardio', 'QR membre'] },
  { id: 'standard', name: 'Standard', price: 350, popular: true, perks: ['Cours collectifs', 'Suivi coach', 'Boutique promo'] },
  { id: 'pro', name: 'Pro', price: 450, perks: ['Coaching avance', 'Priorite planning', 'Suivi premium'] },
];

const durations = [
  { months: 1, label: '1 mois', multiplier: 1 },
  { months: 3, label: '3 mois', multiplier: 3 },
  { months: 12, label: '1 annee', multiplier: 11, badge: '1 mois gratuit' },
];

const fallbackSchedule = [
  {
    day: 'lundi',
    sessions: [
      { id: 'demo-zumba', title: 'Zumba Energy', type: 'zumba', start_time: '18:00:00', end_time: '19:00:00', max_capacity: 22, current_enrollments: 12, coach: { first_name: 'Sara' }, description: 'Cours cardio danse pour tous niveaux.' },
    ],
  },
  {
    day: 'mercredi',
    sessions: [
      { id: 'demo-crossfit', title: 'CrossFit Force', type: 'crossfit', start_time: '19:00:00', end_time: '20:00:00', max_capacity: 16, current_enrollments: 9, coach: { first_name: 'Yassine' }, description: 'WOD complet: force, cardio et technique.' },
    ],
  },
  {
    day: 'vendredi',
    sessions: [
      { id: 'demo-bodypump', title: 'Body Pump', type: 'body_pump', start_time: '17:00:00', end_time: '18:00:00', max_capacity: 20, current_enrollments: 14, coach: { first_name: 'Karim' }, description: 'Renforcement musculaire avec musique.' },
    ],
  },
  {
    day: 'samedi',
    sessions: [
      { id: 'demo-yoga', title: 'Yoga Mobility', type: 'yoga', start_time: '10:00:00', end_time: '11:00:00', max_capacity: 18, current_enrollments: 7, coach: { first_name: 'Nora' }, description: 'Mobilite, respiration et recuperation.' },
    ],
  },
];

const fallbackProducts = [
  ['Black Blood', 'BioTech USA', 'Complements alimentaires', 'pre workout', 399, 30, true, blackBloodImg],
  ['ISO Whey Zero Black', 'BioTech USA', 'Complements alimentaires', 'whey', 1199, 20, true, isoWheyZeroBlackImg],
  ['Tribooster', 'BioTech USA', 'Complements alimentaires', 'tribooster', 699, 12, false, triboosterImg],
  ['GH Hormone', 'BioTech USA', 'Complements alimentaires', 'gh hormone', 899, 6, false, ghHormoneImg],
  ['Multivitamin For Women', 'BioTech USA', 'Complements alimentaires', 'multivitamine', 299, 60, false, multivitaminesWomenImg],
  ['Pack Complement Premium', 'BioTech USA', 'Complements alimentaires', 'pack', 1999, 15, true, packImg],
  ['Muscle Mass', 'BioTech USA', 'Complements alimentaires', 'mass', 449, 20, false, muscleMassImg],
  ['Glutamine Zero', 'BioTech USA', 'Complements alimentaires', 'glutamine', 299, 25, false, glutaminesImg],
  ['One-A-Day', 'BioTech USA', 'Complements alimentaires', 'multivitamine', 299, 60, false, oneADayImg],
  ['BCAA 6000', 'BioTech USA', 'Complements alimentaires', 'bcaa', 310, 21, false, bcaa6000Img],
  ['100% Creatine Monohydrate', 'BioTech USA', 'Complements alimentaires', 'creatine', 349, 50, false, creatineImg],
  ['ISO Whey Zero', 'BioTech USA', 'Complements alimentaires', 'whey', 1299, 18, true, wheyZeroBlueImg],
].map(([name, brand, category, tag, price, stock, promo, image_url], index) => ({
  id: `p-${index}`,
  name,
  brand,
  category,
  tag,
  price,
  stock,
  promo,
  image_url,
}));

const localProductImages = {
  'black blood': blackBloodImg,
  'iso whey zero black': isoWheyZeroBlackImg,
  'iso whey zero': wheyZeroBlueImg,
  'creatine': creatineImg,
  '100% creatine monohydrate': creatineImg,
  'multivitamin for women': multivitaminesWomenImg,
  'one-a-day': oneADayImg,
  'gh hormone': ghHormoneImg,
  'tribooster': triboosterImg,
  'muscle mass': muscleMassImg,
  'bcaa 6000': bcaa6000Img,
  'glutamine zero': glutaminesImg,
  'pack complement premium': packImg,
};

const roleMenus = {
  admin: [
    ['Profil', ['profil']],
    ['Vue generale', ['analytics', 'notifications']],
    ['Planning', ['planning', 'calendrier']],
    ['Salaires', ['salaires', 'primes']],
    ['Membres', ['clients', 'coachs']],
    ['Boutique', ['boutique', 'commandes']],
  ],
  coach: [
    ['Profil', ['profil']],
    ['Contrat', ['contrat']],
    ['Mon espace', ['coach-overview', 'planning', 'clients', 'conges']],
    ['Programmes', ['programmes']],
    ['Primes', ['bonus', 'inscriptions']],
    ['Communication', ['notifications', 'chat']],
  ],
  responsable: [
    ['Profil', ['profil']],
    ['Operations', ['responsable-overview', 'demandes-coach', 'planning', 'clients-actifs']],
    ['Equipe', ['coachs-jour', 'calendrier']],
    ['Acces', ['qr', 'notifications']],
  ],
  client: [
    ['Profil', ['profil']],
    ['Club', ['client-overview', 'planning', 'qr']],
    ['Abonnements', ['offres', 'paiements']],
    ['Nutrition', ['kcal']],
    ['Shopping', ['boutique', 'favoris']],
  ],
};

function money(value) {
  return `${Math.round(Number(value || 0)).toLocaleString('fr-FR')} MAD`;
}

function profilePhotoFor(user) {
  const seed = encodeURIComponent(user?.email || user?.name || 'wifak');
  return user?.avatar_url || user?.profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&backgroundColor=111111,3f3f46,f4f4f5&fontWeight=800`;
}

function App() {
  const [screen, setScreen] = useState('roles');
  const [selectedRole, setSelectedRole] = useState('coach');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('wifak_user') || 'null'));

  if (user) {
    return <Workspace user={user} onLogout={() => {
      localStorage.clear();
      setUser(null);
      setScreen('roles');
    }} />;
  }

  return (
    <AuthExperience
      screen={screen}
      setScreen={setScreen}
      selectedRole={selectedRole}
      setSelectedRole={setSelectedRole}
      authMode={authMode}
      setAuthMode={setAuthMode}
      onAuthenticated={(nextUser, tokens = {}) => {
        if (tokens.access) localStorage.setItem('wifak_access', tokens.access);
        if (tokens.refresh) localStorage.setItem('wifak_refresh', tokens.refresh);
        localStorage.setItem('wifak_user', JSON.stringify(nextUser));
        setUser(nextUser);
      }}
    />
  );
}

function AuthExperience(props) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((current) => (current + 1) % heroSlides.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="landing" style={{ '--hero-image': `url(${heroSlides[slide]})` }}>
      <div className="landing-overlay" />
      <section className="landing-content">
        <div className="landing-copy glass-dark">
          <img className="landing-logo" src={logoUrl} alt="Wifak Club Gym" />
          <span className="eyebrow premium">Wifak Club Gym</span>
          <h1>Portail de Gestion</h1>
          <p className="hero-motto">No pain. No gain.</p>
        </div>
        <div className="landing-panel glass-dark">
          {props.screen === 'roles' && <RoleChooser {...props} />}
          {props.screen === 'auth' && <AuthPanel {...props} />}
          {props.screen === 'offers' && <Offers onBack={() => props.setScreen('roles')} />}
        </div>
      </section>
    </main>
  );
}

function RoleChooser({ selectedRole, setSelectedRole, setScreen, setAuthMode }) {
  return (
    <div>
      <p className="eyebrow premium">Choisissez votre espace</p>
      <div className="role-grid premium-grid">
        {roles.map(({ id, label, icon: Icon, hint }) => (
          <button className={`role-card premium-role ${selectedRole === id ? 'active' : ''}`} key={id} onClick={() => setSelectedRole(id)}>
            <Icon size={24} />
            <strong>{label}</strong>
            <small className="role-hint-in-card">{hint}</small>
          </button>
        ))}
      </div>
      <div className="role-actions">
        <button className="primary-action red" onClick={() => { setAuthMode('login'); setScreen('auth'); }}>Connexion</button>
        {selectedRole === 'client' && <button className="ghost-action light" onClick={() => { setAuthMode('register'); setScreen('auth'); }}>Creer un compte</button>}
        {selectedRole === 'client' && <button className="ghost-action light" onClick={() => setScreen('offers')}>Voir les offres</button>}
        {selectedRole === 'coach' && <button className="ghost-action light" onClick={() => { setAuthMode('register'); setScreen('auth'); }}>Creer compte + contrat</button>}
        {['admin', 'responsable'].includes(selectedRole) && <button className="ghost-action light" onClick={() => { setAuthMode('login'); setScreen('auth'); }}>Acces interne</button>}
      </div>
    </div>
  );
}

function AuthPanel({ selectedRole, setSelectedRole, authMode, setAuthMode, onAuthenticated, setScreen }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    subscription_type: 'standard',
    specialty: 'musculation',
    base_salary: 3000,
    payment_method: 'card',
    card_number: '',
    card_brand: '',
    card_name: '',
    card_expiry: '',
    card_cvv: '',
    verification_code: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [verificationStep, setVerificationStep] = useState(null);

  const requestOtp = async () => {
    if (selectedRole === 'coach' && !form.phone) {
      setStatus('Saisissez le numero de telephone du coach avant de demander le code SMS.');
      return;
    }
    if (!form.email && !form.phone) {
      setStatus('Saisissez votre email ou votre numero de telephone avant de demander le code.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/otp/request/', { email: form.email, phone: form.phone, role: selectedRole });
      const message = data.notification?.message || 'Code envoye.';
      const devCode = data.notification?.dev_code ? ` Code test: ${data.notification.dev_code}` : '';
      setStatus(`${message}${devCode}`);
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Impossible d envoyer le code.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      if (authMode === 'login') {
        const internalLogin = ['admin', 'responsable'].includes(selectedRole);
        const { data } = await api.post('/auth/login/', {
          email: form.email,
          password: form.password,
          role: selectedRole,
          verification_code: verificationStep ? form.verification_code : '',
        });
        if (data.requires_verification && internalLogin) {
          setVerificationStep({ email: data.email, role: data.role });
          setStatus('Mot de passe valide. Entrez le code de verification.');
          return;
        }
        onAuthenticated({ ...data.user, avatar_url: photoPreview || data.user.avatar_url }, data);
      } else if (authMode === 'register') {
        const endpoint = selectedRole === 'coach' ? '/auth/register-coach/' : '/auth/register-client/';
        const payload = selectedRole === 'coach'
          ? {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              phone: form.phone,
              password: form.password,
              password_confirm: form.password_confirm,
              specialties: [form.specialty],
              base_salary: form.base_salary,
            }
          : {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              phone: form.phone,
              password: form.password,
              subscription_type: form.subscription_type,
              payment_method: form.payment_method,
              card_number: form.payment_method === 'card' ? form.card_number : '',
              card_name: form.payment_method === 'card' ? form.card_name : `${form.first_name} ${form.last_name}`,
              card_expiry: form.payment_method === 'card' ? form.card_expiry : '',
              card_cvv: form.payment_method === 'card' ? form.card_cvv : '',
            };
        const { data } = await api.post(endpoint, payload);
        if (selectedRole === 'coach') {
          setStatus(data.notification?.message || "Demande envoyee au responsable d'accueil.");
          setAuthMode('login');
          setForm({ ...form, password: '', password_confirm: '', otp: '' });
          return;
        }
        onAuthenticated({ ...data.user, avatar_url: photoPreview }, data);
      } else if (authMode === 'forgot') {
        await api.post('/auth/password-reset/request/', { email: form.email });
        setStatus('Si ce compte existe, un email de recuperation a ete envoye.');
      } else {
        const { data } = await api.post('/auth/otp/verify/', { email: form.email, code: form.otp });
        onAuthenticated({ ...data.user, avatar_url: photoPreview || data.user.avatar_url }, data);
      }
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Backend indisponible. Demarrez le serveur Django sur le port 8000.');
    } finally {
      setBusy(false);
    }
  };

  const detectCardBrand = (number) => {
    const digits = number.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'Visa';
    const firstTwo = Number(digits.slice(0, 2));
    const firstFour = Number(digits.slice(0, 4));
    if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) return 'Mastercard';
    return '';
  };

  const handleCardNumberChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 19);
    setForm({
      ...form,
      card_number: cleaned,
      card_brand: detectCardBrand(cleaned),
    });
  };

  const formatCardExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleCardExpiryChange = (value) => {
    setForm({ ...form, card_expiry: formatCardExpiry(value) });
  };

  const pickPhoto = (event) => {
    const file = event.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const authModes = [
    ['login', 'Connexion'],
    ...(['client', 'coach'].includes(selectedRole) ? [['register', selectedRole === 'coach' ? 'Compte + contrat' : 'Creer compte']] : []),
  ];

  return (
    <form className={`auth-panel glass-auth auth-mode-${authMode}`} onSubmit={submit}>
      <div className="auth-head">
        <button type="button" className="ghost-action light" onClick={() => setScreen('roles')}>Retour roles</button>
        {selectedRole === 'client' && <button type="button" className="ghost-action light" onClick={() => setScreen('offers')}>Offres</button>}
      </div>
      <div className="auth-switch-block">
        <span>Role</span>
        <div className="switch-row role-switch">
          {roles.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              className={selectedRole === id ? 'active' : ''}
              key={id}
              onClick={() => {
                setSelectedRole(id);
                setStatus('');
                setVerificationStep(null);
                if (!['client', 'coach'].includes(id) && authMode === 'register') setAuthMode('login');
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="auth-switch-block">
        <span>Mode</span>
        <div className="switch-row mode-switcher">
          {authModes.map(([mode, label]) => (
            <button
              type="button"
              className={authMode === mode ? 'active' : ''}
              key={mode}
              onClick={() => {
                setAuthMode(mode);
                setStatus('');
                setVerificationStep(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow premium">{selectedRole}</p>
        <h2>{verificationStep ? 'Code de verification' : authMode === 'login' ? 'Connexion' : authMode === 'register' ? (selectedRole === 'coach' ? 'Creer compte + contrat' : 'Creer un compte client') : ''}</h2>
      </div>
      {verificationStep ? (
        <div className="coach-contract-box">
          <p className="help-text">Connexion valide pour {verificationStep.email}. Saisissez le code de verification a 8 chiffres.</p>
          <label>Code de verification
            <input
              autoFocus
              inputMode="numeric"
              maxLength={8}
              value={form.verification_code}
              onChange={(e) => setForm({ ...form, verification_code: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              placeholder="Code"
              required
            />
          </label>
        </div>
      ) : authMode === 'register' && ['client', 'coach'].includes(selectedRole) && (
        <div className="form-grid">
          <label>Prenom<input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></label>
          <label>Nom<input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></label>
          <label>Telephone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Photo profil<input type="file" accept="image/*" onChange={pickPhoto} /></label>
        </div>
      )}
      {photoPreview && <img className="auth-photo-preview" src={photoPreview} alt="Preview profil" />}
      {!verificationStep && (
        <>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Mot de passe<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          {authMode === 'register' && selectedRole === 'coach' && <label>Confirmation mot de passe<input type="password" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required /></label>}
        </>
      )}
      {!verificationStep && authMode === 'register' && selectedRole === 'client' && (
        <>
          <div className="subscription-switch">
            <span>Offre client</span>
            <div className="subscription-buttons">
              {[
                { value: 'simple', label: 'Basic' },
                { value: 'standard', label: 'Standard' },
                { value: 'pro', label: 'Pro' },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={form.subscription_type === option.value ? 'active' : ''}
                  onClick={() => setForm({ ...form, subscription_type: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="payment-switch">
            <span>Mode de paiement</span>
            <div className="payment-buttons">
              {['card', 'cash'].map((method) => (
                <button
                  type="button"
                  key={method}
                  className={form.payment_method === method ? 'active' : ''}
                  onClick={() => setForm({ ...form, payment_method: method })}
                >
                  {method === 'card' ? 'Carte bancaire' : 'Reçu à l\'accueil'}
                </button>
              ))}
            </div>
          </div>
          {form.payment_method === 'card' && (
            <>
              <label>Numero carte
                <input
                  value={form.card_number}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                />
                {form.card_brand && <small className="card-brand">{form.card_brand}</small>}
              </label>
              <label>Nom sur carte<input value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} /></label>
              <label>Expiration<input value={form.card_expiry} onChange={(e) => handleCardExpiryChange(e.target.value)} placeholder="MM/AA" maxLength={5} /></label>
              <label>CVV<input value={form.card_cvv} onChange={(e) => setForm({ ...form, card_cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" maxLength={4} /></label>
            </>
          )}
          {form.payment_method === 'cash' && <p className="help-text">Vous pouvez imprimer ou recuperer un reçu à l'accueil pour régler votre abonnement.</p>}
        </>
      )}
      {!verificationStep && authMode === 'register' && selectedRole === 'coach' && (
        <div className="coach-contract-box">
          <label>Specialite coach<select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}><option value="musculation">Musculation</option><option value="biking">Biking</option><option value="aerobic">Aerobic</option><option value="zumba">Zumba</option><option value="body_pump">Body Pump</option><option value="yoga">Yoga</option></select></label>
          <label>Salaire de base<input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} /></label>
          <div className="contract-mini">
            <ContractIcon size={26} />
            <div><strong>Contrat coach</strong><span>Votre demande sera envoyee au responsable d'accueil pour approbation.</span></div>
          </div>
        </div>
      )}
      {!verificationStep && authMode === 'register' && ['admin', 'responsable'].includes(selectedRole) && <p className="form-status">La creation de compte {selectedRole} se fait par l'administration. Utilisez la connexion.</p>}
      <button className="primary-action red" disabled={busy}>{busy ? 'Chargement...' : 'Valider'}</button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}

function Workspace({ user, onLogout }) {
  const role = user.role === 'reception' ? 'responsable' : user.role;
  const defaultSection = role === 'admin' ? 'analytics' : role === 'coach' ? 'coach-overview' : role === 'responsable' ? 'responsable-overview' : 'client-overview';
  const [section, setSection] = useState(defaultSection);
  const [openMenus, setOpenMenus] = useState({ Profil: true, 'Vue generale': true, 'Mon espace': true, Operations: true, Club: true });
  const [actionNotice, setActionNotice] = useState('');
  const [internalNotifications, setInternalNotifications] = useState([]);

  const roleHint = (roles.find((r) => r.id === role) || {}).hint || '';

  useEffect(() => {
    setSection(defaultSection);
  }, [defaultSection]);

  const pushInternalNotification = (title, message) => {
    const notification = {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      created_at: new Date().toISOString(),
    };
    setInternalNotifications((items) => [notification, ...items]);
    return notification;
  };

  const sendRoleNotification = () => {
    pushInternalNotification(
      `Notification ${role}`,
      `Notification interne demandee depuis l espace ${role} par ${user.email}.`
    );
    setActionNotice('Notification ajoutee dans l application.');
  };

  const exportPdf = () => {
    setActionNotice(`Export PDF ${role}: la fenetre impression est ouverte.`);
    window.setTimeout(() => window.print(), 80);
  };

  return (
    <div className="workspace premium-workspace">
      <aside className="sidebar premium-sidebar">
        <div className="brand-topline dark">
          <img className="brand-logo brand-logo-small" src={logoUrl} alt="Wifak Club Gym" />
          <div><strong>Wifak Club</strong><span>Fitness Management</span></div>
        </div>
        <ProfileMini user={user} />
        <nav className="accordion-nav">
          {(roleMenus[role] || roleMenus.client).map(([title, items]) => {
            const isOpen = openMenus[title];
            return (
              <div className="nav-group" key={title}>
                <button className="nav-title" onClick={() => setOpenMenus({ ...openMenus, [title]: !isOpen })}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {title}
                </button>
                {isOpen && items.map((item) => (
                  <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}>
                    {labelFor(item)}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <button className="logout-button" onClick={onLogout}><LogOut size={17} /> Deconnexion</button>
      </aside>
      <main className="main-view premium-main">
        <header className="topbar">
          <div>
            <p className="eyebrow premium">{role}</p>
            <h1>{labelFor(section)}</h1>
            {roleHint && <small className="role-hint">{roleHint}</small>}
            <span className="welcome">Bonjour {user.name || user.email}</span>
          </div>
          <div className="top-actions">
            <button onClick={sendRoleNotification}><Bell size={17} /> Notifications {role}</button>
            <button onClick={exportPdf}><FileDown size={17} /> Export PDF {role}</button>
          </div>
        </header>
        {actionNotice && <p className="inline-status action-notice">{actionNotice}</p>}
        <Dashboard
          key={`${role}-${section}`}
          role={role}
          section={section}
          user={user}
          internalNotifications={internalNotifications}
          onInternalNotify={pushInternalNotification}
        />
      </main>
    </div>
  );
}

function Dashboard({ role, section, user, internalNotifications = [], onInternalNotify }) {
  const [data, setData] = useState({ stats: null, sessions: [], members: [], coaches: [], products: [], bonuses: [], notifications: [], payments: [] });
  const [localBonuses, setLocalBonuses] = useState([]);
  const [localEnrollments, setLocalEnrollments] = useState([]);
  const [localLeaveRequests, setLocalLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const addCoachBonus = (label, amount, period = 'Aujourd hui') => {
    setLocalBonuses((items) => [{ id: `bonus-${Date.now()}`, label, amount, period }, ...items]);
  };

  useEffect(() => {
    let alive = true;
    setData({ stats: null, sessions: [], members: [], coaches: [], products: [], bonuses: [], notifications: [], payments: [] });
    setLoading(true);

    async function load() {
      try {
        const calls = [
          api.get('/schedule/').catch(() => ({ data: [] })),
          api.get('/notifications/').catch(() => ({ data: [] })),
        ];
        if (['admin', 'responsable'].includes(role)) calls.push(api.get('/members/').catch(() => ({ data: [] })), api.get('/coaches/').catch(() => ({ data: [] })));
        if (['admin', 'responsable'].includes(role)) calls.push(api.get('/stats/overview/').catch(() => ({ data: null })));
        if (role === 'admin') calls.push(api.get('/products/').catch(() => ({ data: fallbackProducts })));
        if (role === 'coach') calls.push(api.get('/coach-bonuses/').catch(() => ({ data: [] })), api.get('/enrollments/').catch(() => ({ data: [] })));
        if (role === 'client') calls.push(api.get('/client/payments/').catch(() => ({ data: [] })));
        const responses = await Promise.all(calls);
        if (!alive) return;
        const next = { stats: null, sessions: responses[0].data, notifications: responses[1].data, members: [], coaches: [], products: [], bonuses: [], enrollments: [], payments: [] };
        if (['admin', 'responsable'].includes(role)) {
          next.members = responses[2]?.data || [];
          next.coaches = responses[3]?.data || [];
        }
        if (['admin', 'responsable'].includes(role)) {
          next.stats = responses[4]?.data || null;
        }
        if (role === 'admin') {
          next.products = normalizeProducts(responses[5]?.data);
        }
        if (role === 'coach') {
          next.bonuses = responses[2]?.data || [];
          next.enrollments = responses[3]?.data || [];
        }
        if (role === 'client') {
          next.payments = responses[2]?.data || [];
        }
        setData(next);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [role, section]);

  if (loading) return <LoadingGrid />;
  if (section === 'profil') return <ProfilePanel user={user} role={role} />;
  if (section === 'contrat') return <ContractPanel user={user} />;
  if (section === 'boutique' || section === 'favoris') return <Shop products={data.products.length ? data.products : fallbackProducts} />;
  if (section === 'offres' && role === 'client') return <Offers currentType={user.member?.subscription_type} />;
  if (section === 'paiements' && role === 'client') return <PaymentHistory payments={data.payments} user={user} />;
  if (section === 'kcal' && role === 'client') return <KcalCalculator />;
  if (section === 'qr') return <QrPanel user={user} />;
  const enrollments = [...localEnrollments, ...(data.enrollments || [])];

  if (section === 'notifications') return <NotificationsPanel notifications={[...internalNotifications, ...(data.notifications || [])]} />;
  if (section === 'chat') return <ChatPanel onInternalNotify={onInternalNotify} />;
  if (section === 'programmes' && role === 'coach') return <CoachProgramsPanel onInternalNotify={onInternalNotify} onCoachBonus={addCoachBonus} />;
  if (section === 'conges' && role === 'coach') return <CoachLeavePanel user={user} requests={localLeaveRequests} onRequest={(request) => {
    setLocalLeaveRequests((items) => [request, ...items]);
    onInternalNotify?.('Demande de conge', `${user.name || user.email} demande un conge du ${request.start_date} au ${request.end_date}.`);
  }} />;
  if (section === 'clients' && role === 'coach') return <CoachClientsPanel enrollments={enrollments} sessions={data.sessions} />;
  if (['bonus', 'inscriptions'].includes(section) && role === 'coach') return <CoachBonusPanel bonuses={[...localBonuses, ...(data.bonuses || [])]} enrollments={enrollments} sessions={data.sessions} />;
  if (['planning', 'calendrier'].includes(section)) return <Schedule sessions={data.sessions} role={role} user={user} coaches={data.coaches} onInternalNotify={onInternalNotify} onCoachBonus={addCoachBonus} onClientEnroll={(enrollment) => setLocalEnrollments((items) => [enrollment, ...items])} />;
  if (section === 'demandes-coach' && role === 'responsable') return <CoachRequests initialCoaches={data.coaches} onInternalNotify={onInternalNotify} />;
  if (role === 'admin') return <AdminDashboard section={section} data={data} />;
  if (role === 'coach') return <CoachDashboard data={{ ...data, enrollments, bonuses: [...localBonuses, ...(data.bonuses || [])] }} />;
  if (role === 'responsable') return <ResponsableDashboard data={data} />;
  return <ClientDashboard user={user} payments={data.payments} sessions={data.sessions} enrollments={enrollments} onClientEnroll={(enrollment) => setLocalEnrollments((items) => [enrollment, ...items])} onInternalNotify={onInternalNotify} />;
}

function normalizeProducts(products = []) {
  if (!products.length) return fallbackProducts;
  return products.map((product, index) => {
    const tagKey = String(product.tag || product.name || '').toLowerCase();
    return {
      ...product,
      category: product.category === 'accessories' ? 'Accessoires fitness' : product.category || 'Complements alimentaires',
      image_url: product.image_url || localProductImages[tagKey] || fallbackProducts[index % fallbackProducts.length]?.image_url,
    };
  });
}

function AdminDashboard({ section, data }) {
  const stats = data.stats || {};
  return (
    <>
      <MetricGrid cards={[
        ['Revenus du mois', money(stats.monthly_revenue), Wallet],
        ['Clients', stats.total_members || data.members.length, Users],
        ['Coachs', stats.total_coaches || data.coaches.length, Dumbbell],
        ['Ventes boutique', money((data.products || []).reduce((sum, p) => sum + Number(p.price || 0), 0) * 0.18), ShoppingBag],
      ]} />
      <div className="view-grid">
        <Panel title="Analytics"><Bars rows={[['Abonnements actifs', stats.active_subscriptions || 0], ['Inscriptions mois', stats.total_enrollments_this_month || 0], ['Cours du jour', stats.total_sessions_today || 0]]} /></Panel>
        <Panel title="Section active"><ActionSummary section={section} /></Panel>
      </div>
    </>
  );
}

function CoachDashboard({ data }) {
  const totalBonus = (data.bonuses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <>
      <MetricGrid cards={[['Cours du jour', flattenSessions(data.sessions).length, CalendarDays], ['Mes clients', data.enrollments?.length || 0, Users], ['Total bonus', money(totalBonus), Wallet], ['Progression', '78%', Activity]]} />
      <div className="view-grid">
        <CoachClientsPanel enrollments={data.enrollments} sessions={data.sessions} compact />
        <CoachBonusPanel bonuses={data.bonuses} enrollments={data.enrollments} sessions={data.sessions} compact />
      </div>
    </>
  );
}

function CoachProgramsPanel({ onInternalNotify, onCoachBonus }) {
  const [activeTool, setActiveTool] = useState('kcal');
  const tools = [
    ['kcal', 'Calculateur kcal', Activity],
    ['nutrition', 'Programme nutrition', Heart],
    ['training', 'Programme entrainement', Dumbbell],
  ];

  return (
    <section className="panel premium-panel program-suite">
      <div className="panel-heading"><span>Programmes coach</span></div>
      <div className="panel-body">
        <div className="program-tabs">
          {tools.map(([id, label, Icon]) => (
            <button type="button" className={activeTool === id ? 'active' : ''} key={id} onClick={() => setActiveTool(id)}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        {activeTool === 'kcal' && <KcalCalculator compact />}
        {activeTool === 'nutrition' && <KcalCalculator nutritionOnly onProgramWritten={() => {
          onCoachBonus?.('Programme nutrition redige', 50);
          onInternalNotify?.('Programme nutrition', 'Un programme nutrition a ete redige par le coach.');
        }} />}
        {activeTool === 'training' && <TrainingProgramPanel onProgramWritten={() => {
          onCoachBonus?.('Programme entrainement redige', 50);
          onInternalNotify?.('Programme entrainement', 'Un programme d entrainement a ete redige par le coach.');
        }} />}
      </div>
    </section>
  );
}

function CoachClientsPanel({ enrollments = [], sessions = [], compact = false }) {
  const enrollmentRows = (enrollments || []).map((item) => [
    enrollmentName(item),
    item.session?.title || item.course?.title || item.session_title || 'Cours coach',
    item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : (item.status || 'Adherent'),
  ]);
  const sessionRows = flattenSessions(sessions).map((session) => [
    session.title,
    `${session.current_enrollments || 0}/${session.max_capacity || 0} clients`,
    `${session.day || ''} ${session.start_time?.slice(0, 5) || ''}`,
  ]);

  return (
    <Panel title={compact ? 'Clients adheres' : 'Clients adheres a mes cours'}>
      <Rows rows={enrollmentRows.length ? enrollmentRows : sessionRows} empty="Aucun client adherent visible pour le moment." />
    </Panel>
  );
}

function CoachBonusPanel({ bonuses = [], enrollments = [], sessions = [], compact = false }) {
  const programRows = bonuses.map((bonus) => [bonus.label || bonus.reason || 'Prime coach', money(bonus.amount || 0), bonus.period || bonus.created_at || '']);
  const memberRows = (enrollments || []).map((item) => [`Membre ajoute: ${enrollmentName(item)}`, money(25), item.session?.title || item.course?.title || 'Inscription cours']);
  const sessionRows = flattenSessions(sessions)
    .filter((session) => String(session.description || '').toLowerCase().includes('supplementaire'))
    .map((session) => [`Seance ajoutee: ${session.title}`, money(75), session.day || 'Planning']);

  return (
    <Panel title={compact ? 'Bonus coach' : 'Bonus par seance, membre et programme'}>
      <Rows rows={[...programRows, ...memberRows, ...sessionRows]} empty="Aucun bonus enregistre pour le moment." />
    </Panel>
  );
}

function CoachLeavePanel({ user, requests = [], onRequest }) {
  const minLeaveDate = '2026-06-01';
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    type: 'repos',
  });
  const [notice, setNotice] = useState('');

  const submitLeave = async (event) => {
    event.preventDefault();
    if (!form.start_date || !form.end_date) {
      setNotice('Choisissez la date debut et fin du conge.');
      return;
    }
    const start = new Date(`${form.start_date}T00:00:00`);
    const end = new Date(`${form.end_date}T00:00:00`);
    const minDate = new Date(`${minLeaveDate}T00:00:00`);
    const durationDays = Math.floor((end - start) / 86400000) + 1;
    if (start < minDate || end < minDate) {
      setNotice('Les conges avant juin 2026 ne sont pas acceptes.');
      return;
    }
    if (end < start) {
      setNotice('La date de fin doit etre apres la date de debut.');
      return;
    }
    if (durationDays > 18) {
      setNotice('La demande de conge ne peut pas depasser 18 jours.');
      return;
    }
    const request = {
      ...form,
      days: durationDays,
      id: `leave-${Date.now()}`,
      coach: user.name || user.email,
      status: 'En attente',
      created_at: new Date().toISOString(),
    };
    onRequest?.(request);
    setNotice('Demande de conge envoyee au responsable.');
    setForm({ start_date: '', end_date: '', reason: '', type: 'repos' });
  };

  const rows = requests.map((request) => [
    `${request.start_date} -> ${request.end_date}`,
    request.type,
    request.status,
  ]);

  return (
    <Panel title="Demande de conge">
      <form className="leave-form" onSubmit={submitLeave}>
        <div className="form-grid">
          <label>Debut<input type="date" min={minLeaveDate} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
          <label>Fin<input type="date" min={form.start_date || minLeaveDate} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
          <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="repos">Repos</option><option value="maladie">Maladie</option><option value="urgence">Urgence</option><option value="vacances">Vacances</option></select></label>
        </div>
        <p className="help-text">Maximum 18 jours. Les dates avant juin 2026 sont bloquees.</p>
        <label>Motif<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Expliquez la demande..." /></label>
        <button className="primary-action red">Envoyer demande</button>
        {notice && <p className="form-status">{notice}</p>}
      </form>
      <Rows rows={rows} empty="Aucune demande de conge envoyee." />
    </Panel>
  );
}

function NotificationsPanel({ notifications = [] }) {
  const rows = notifications.map((item) => [
    item.title || item.subject || 'Notification interne',
    item.message || item.detail || item.body || 'Message dans l application',
    item.created_at ? new Date(item.created_at).toLocaleString('fr-FR') : 'Maintenant',
  ]);
  return (
    <Panel title="Notifications application">
      <Rows rows={rows} empty="Aucune notification dans l application." />
    </Panel>
  );
}

function ResponsableDashboard({ data }) {
  const stats = data.stats || {};
  const approved = stats.approved_coaches ?? data.coaches.filter((coach) => coach.approval_status === 'APPROVED' || coach.is_active).length;
  const pending = stats.pending_coach_requests ?? data.coaches.filter((coach) => coach.approval_status === 'PENDING').length;
  const rejected = stats.rejected_coach_requests ?? data.coaches.filter((coach) => coach.approval_status === 'REJECTED').length;
  return (
    <>
      <MetricGrid cards={[['Coachs approuves', approved, Dumbbell], ['Demandes en attente', pending, Bell], ['Demandes rejetees', rejected, ShieldCheck], ['Clients actifs', data.members.filter((m) => m.is_active).length, Users]]} />
      <div className="view-grid">
        <Schedule sessions={data.sessions} compact role="responsable" coaches={data.coaches} />
        <Panel title="Demandes recentes"><Rows rows={data.coaches.slice(0, 6).map((coach) => [`${coach.first_name} ${coach.last_name}`, coach.phone_number || coach.phone || 'Sans telephone', coach.status_label || coach.approval_status])} /></Panel>
      </div>
    </>
  );
}

function CoachRequests({ initialCoaches = [], onInternalNotify }) {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [notice, setNotice] = useState('');
  const [newCoach, setNewCoach] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: 'musculation',
    base_salary: 3000,
  });
  const [salaryDrafts, setSalaryDrafts] = useState({});

  const load = async () => {
    const { data } = await api.get('/coaches/');
    setCoaches(data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const decide = async (coach, action) => {
    setNotice(`${action === 'approve' ? 'Approbation' : 'Rejet'} de ${coach.first_name} ${coach.last_name}...`);
    try {
      await api.post(`/coaches/${coach.id}/${action}/`, {});
      await load();
      setNotice(action === 'approve' ? 'Coach approuve.' : 'Demande rejetee.');
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Action impossible.');
    }
  };

  const addCoach = async (event) => {
    event.preventDefault();
    if (!newCoach.first_name || !newCoach.email) {
      setNotice('Nom et email du coach obligatoires.');
      return;
    }
    const coach = {
      id: `local-coach-${Date.now()}`,
      first_name: newCoach.first_name,
      last_name: newCoach.last_name,
      email: newCoach.email,
      phone: newCoach.phone,
      phone_number: newCoach.phone,
      specialties: [newCoach.specialty],
      base_salary: Number(newCoach.base_salary || 0),
      approval_status: 'APPROVED',
      status_label: 'Approuve',
      created_at: new Date().toISOString(),
      is_active: true,
    };
    try {
      const { data } = await api.post('/auth/register-coach/', {
        first_name: newCoach.first_name,
        last_name: newCoach.last_name,
        email: newCoach.email,
        phone: newCoach.phone,
        password: 'Coach@12345',
        password_confirm: 'Coach@12345',
        specialties: [newCoach.specialty],
        base_salary: newCoach.base_salary,
      });
      setCoaches((items) => [{ ...coach, ...(data.coach || data.user || {}) }, ...items]);
      setNotice('Coach ajoute. Mot de passe initial: Coach@12345');
    } catch (error) {
      setCoaches((items) => [coach, ...items]);
      setNotice('Coach ajoute localement. Backend indisponible ou validation incomplete.');
    }
    onInternalNotify?.('Coach ajoute', `${newCoach.first_name} ${newCoach.last_name} ajoute par le responsable.`);
    setNewCoach({ first_name: '', last_name: '', email: '', phone: '', specialty: 'musculation', base_salary: 3000 });
  };

  const removeCoach = async (coach) => {
    setNotice(`Suppression de ${coach.first_name} ${coach.last_name}...`);
    try {
      await api.post(`/coaches/${coach.id}/delete/`, {});
      setNotice('Coach supprime.');
    } catch (error) {
      setNotice('Coach supprime localement.');
    }
    setCoaches((items) => items.filter((item) => item.id !== coach.id));
    onInternalNotify?.('Coach supprime', `${coach.first_name} ${coach.last_name} retire de l equipe.`);
  };

  const updateSalary = async (coach) => {
    const amount = Number(salaryDrafts[coach.id] || coach.base_salary || coach.salary || 0);
    if (!amount) {
      setNotice('Saisissez un salaire valide.');
      return;
    }
    try {
      await api.post(`/coaches/${coach.id}/salary/`, { base_salary: amount });
      setNotice('Salaire ajuste.');
    } catch (error) {
      setNotice('Salaire ajuste localement.');
    }
    setCoaches((items) => items.map((item) => item.id === coach.id ? { ...item, base_salary: amount } : item));
    onInternalNotify?.('Salaire coach ajuste', `${coach.first_name} ${coach.last_name}: ${money(amount)}.`);
  };

  return (
    <section className="panel premium-panel coach-requests">
      <div className="panel-heading"><span>Gestion des Coachs</span></div>
      <div className="panel-body">
        {notice && <p className="inline-status action-notice">{notice}</p>}
        <form className="coach-management-form" onSubmit={addCoach}>
          <div className="form-grid">
            <label>Prenom<input value={newCoach.first_name} onChange={(e) => setNewCoach({ ...newCoach, first_name: e.target.value })} placeholder="Prenom" /></label>
            <label>Nom<input value={newCoach.last_name} onChange={(e) => setNewCoach({ ...newCoach, last_name: e.target.value })} placeholder="Nom" /></label>
            <label>Email<input value={newCoach.email} onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })} placeholder="coach@email.com" /></label>
            <label>Telephone<input value={newCoach.phone} onChange={(e) => setNewCoach({ ...newCoach, phone: e.target.value })} placeholder="06..." /></label>
            <label>Specialite<select value={newCoach.specialty} onChange={(e) => setNewCoach({ ...newCoach, specialty: e.target.value })}><option value="musculation">Musculation</option><option value="crossfit">CrossFit</option><option value="zumba">Zumba</option><option value="body_pump">Body Pump</option><option value="yoga">Yoga</option></select></label>
            <label>Salaire<input type="number" value={newCoach.base_salary} onChange={(e) => setNewCoach({ ...newCoach, base_salary: e.target.value })} /></label>
          </div>
          <button className="primary-action red">Ajouter coach</button>
        </form>
        <div className="table-scroll">
          <table className="table table-dark table-hover align-middle data-table coach-request-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Telephone</th>
                <th>Salaire</th>
                <th>Date de demande</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id}>
                  <td><strong>{coach.first_name} {coach.last_name}</strong><span>{(coach.specialties || []).join(', ') || 'Sans specialite'}</span></td>
                  <td>{coach.email}</td>
                  <td>{coach.phone_number || coach.phone || 'Non renseigne'}</td>
                  <td>
                    <div className="salary-adjust">
                      <input type="number" value={salaryDrafts[coach.id] ?? coach.base_salary ?? coach.salary ?? 3000} onChange={(e) => setSalaryDrafts({ ...salaryDrafts, [coach.id]: e.target.value })} />
                      <button type="button" onClick={() => updateSalary(coach)}>Ajuster</button>
                    </div>
                  </td>
                  <td>{new Date(coach.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><span className={`status-badge status-${String(coach.approval_status || '').toLowerCase()}`}>{coach.status_label || coach.approval_status}</span></td>
                  <td>
                    <div className="request-actions">
                      <button disabled={coach.approval_status === 'APPROVED'} onClick={() => decide(coach, 'approve')}>Approuver</button>
                      <button disabled={coach.approval_status === 'REJECTED'} onClick={() => decide(coach, 'reject')}>Rejeter</button>
                      <button onClick={() => setNotice(`${coach.first_name} ${coach.last_name} - ${coach.email} - ${coach.phone_number || coach.phone || 'Sans telephone'}`)}>Voir details</button>
                      <button className="danger-action" onClick={() => removeCoach(coach)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!coaches.length && (
                <tr><td colSpan="7">Aucune demande coach.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ClientDashboard({ user, payments = [], sessions = [], enrollments = [], onClientEnroll, onInternalNotify }) {
  const [detail, setDetail] = useState('offres');
  const detailPanels = {
    offres: <Offers currentType={user.member?.subscription_type} detailed />,
    paiements: <PaymentHistory payments={payments} user={user} />,
    planning: <Schedule sessions={sessions} role="client" user={user} compact enrollments={enrollments} onClientEnroll={onClientEnroll} onInternalNotify={onInternalNotify} />,
    kcal: <KcalCalculator compact />,
  };

  return (
    <>
      <ProfilePanel user={user} role="client" compact />
      <div className="client-spotlight">
        <div>
          <span>Club interactif</span>
          <h2>Choisissez une offre, consultez l historique et reservez vos seances.</h2>
        </div>
        <button type="button" onClick={() => setDetail('planning')}>Voir les seances</button>
      </div>
      <MetricGrid cards={[
        ['QR membre', user.qr_code || 'Actif', makeIcon('contract'), () => setDetail('planning')],
        ['Offre', user.member?.subscription_type || 'Standard', Crown, () => setDetail('offres')],
        ['Paiements', payments.length || 'Historique', Wallet, () => setDetail('paiements')],
        ['Kcal', 'Calculer', Activity, () => setDetail('kcal')],
      ]} />
      <div className="client-detail-switch">
        {[
          ['offres', 'Detail offre'],
          ['paiements', 'Historique'],
          ['planning', 'Seances'],
          ['kcal', 'Kcal'],
        ].map(([id, label]) => <button type="button" className={detail === id ? 'active' : ''} key={id} onClick={() => setDetail(id)}>{label}</button>)}
      </div>
      <div className="detail-dock">{detailPanels[detail]}</div>
      <div className="view-grid">
        <Offers currentType={user.member?.subscription_type} />
        <Schedule sessions={sessions} role="client" user={user} compact enrollments={enrollments} onClientEnroll={onClientEnroll} onInternalNotify={onInternalNotify} />
        <QrPanel user={user} compact />
      </div>
    </>
  );
}

function MetricGrid({ cards }) {
  return <div className="stats-grid">{cards.map(([label, value, Icon, action]) => {
    const Tile = action ? 'button' : 'div';
    return <Tile type={action ? 'button' : undefined} onClick={action} className={`metric-tile premium-tile ${action ? 'clickable-tile' : ''}`} key={label}><Icon size={22} /><span>{label}</span><strong>{value}</strong></Tile>;
  })}</div>;
}

function Offers({ onBack, currentType, detailed = false }) {
  const [duration, setDuration] = useState(durations[1]);
  const [selectedOffer, setSelectedOffer] = useState(currentType === 'simple' ? 'basic' : currentType || 'standard');
  const activeOffer = currentType === 'simple' ? 'basic' : currentType;
  const offerDetail = offers.find((offer) => offer.id === selectedOffer) || offers[1];
  return (
    <section className="panel premium-panel offers-section">
      <div className="panel-heading"><span>Offres abonnements</span>{onBack && <button onClick={onBack}>Retour</button>}</div>
      <div className="duration-tabs">{durations.map((item) => <button className={duration.months === item.months ? 'active' : ''} key={item.label} onClick={() => setDuration(item)}>{item.label}{item.badge && <small>{item.badge}</small>}</button>)}</div>
      <div className="offer-grid">
        {offers.map((offer) => (
          <article className={`offer-card ${offer.popular ? 'popular' : ''} ${activeOffer === offer.id ? 'active-offer' : ''} ${selectedOffer === offer.id ? 'selected-offer' : ''}`} key={offer.id} onClick={() => setSelectedOffer(offer.id)}>
            {activeOffer === offer.id ? <span className="badge">Votre offre</span> : offer.popular && <span className="badge">Populaire</span>}
            <h2>{offer.name}</h2>
            <strong>{money(offer.price * duration.multiplier)}</strong>
            <p>{duration.label} de fitness avec accompagnement Wifak Club.</p>
            {offer.perks.map((perk) => <span className="perk" key={perk}><Star size={14} /> {perk}</span>)}
            <button type="button" className="detail-link">Voir detail</button>
          </article>
        ))}
      </div>
      {detailed && (
        <div className="offer-detail-panel">
          <div>
            <span>Detail offre</span>
            <h2>{offerDetail.name} - {money(offerDetail.price * duration.multiplier)}</h2>
            <p>Cette offre donne acces aux services selectionnes avec suivi dans l application, planning et QR membre.</p>
          </div>
          <div className="detail-facts">
            <strong>{duration.label}</strong>
            <strong>{offerDetail.perks.length} avantages</strong>
            <strong>{offerDetail.popular ? 'Recommandee' : 'Disponible'}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function PaymentHistory({ payments = [], user }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const rows = payments.map((payment) => [
    payment.transaction_ref || `Paiement #${payment.id}`,
    money(payment.amount),
    `${payment.status === 'paid' ? 'Paye' : payment.status} - ${payment.method}`,
  ]);

  return (
    <section className="panel premium-panel">
      <div className="panel-heading"><span>Historique de paiement</span></div>
      <div className="panel-body">
        <div className="contract-grid">
          <div><strong>Client</strong><span>{user.name || user.email}</span></div>
          <div><strong>Offre active</strong><span>{user.member?.subscription_type || 'Sans offre'}</span></div>
          <div><strong>Total paiements</strong><span>{money(payments.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</span></div>
          <div><strong>Nombre</strong><span>{payments.length}</span></div>
        </div>
        {payments.length ? (
          <div className="list-rows">
            {payments.map((payment) => (
              <button type="button" className="mini-row detail-row" key={payment.id || payment.transaction_ref} onClick={() => setSelectedPayment(payment)}>
                <strong>{payment.transaction_ref || `Paiement #${payment.id}`}</strong>
                <span>{money(payment.amount)}</span>
                <small>{payment.status === 'paid' ? 'Paye' : payment.status} - {payment.method}</small>
              </button>
            ))}
          </div>
        ) : (
          <Rows rows={rows} empty="Aucun paiement enregistre pour ce client." />
        )}
        {selectedPayment && (
          <div className="payment-detail-panel">
            <strong>{selectedPayment.transaction_ref || `Paiement #${selectedPayment.id}`}</strong>
            <span>Montant: {money(selectedPayment.amount)}</span>
            <span>Statut: {selectedPayment.status || 'enregistre'}</span>
            <span>Methode: {selectedPayment.method || 'non renseignee'}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function KcalCalculator({ compact = false, nutritionOnly = false, onProgramWritten }) {
  const [form, setForm] = useState({
    gender: 'male',
    age: 25,
    height: 175,
    weight: 75,
    activity: 'moderate',
    steps: 8000,
    strength: 3,
    cardio: 2,
  });
  const [nutrition, setNutrition] = useState({ client: '', goal: 'maintain', notes: '' });
  const [mealPlan, setMealPlan] = useState([]);
  const activityFactors = { low: 1.25, moderate: 1.45, high: 1.65 };
  const bmr = form.gender === 'male'
    ? 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + 5
    : 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) - 161;
  const stepsKcal = Number(form.steps || 0) * 0.04;
  const weeklyTraining = Number(form.strength || 0) * 220 + Number(form.cardio || 0) * 260;
  const dailyTraining = weeklyTraining / 7;
  const maintenance = Math.round(bmr * (activityFactors[form.activity] || 1.45) + stepsKcal + dailyTraining);
  const goalRows = [
    ['Perte de poids', `${maintenance - 400} kcal/jour`, 'Deficit doux'],
    ['Maintien', `${maintenance} kcal/jour`, 'Equilibre'],
    ['Prise de muscle', `${maintenance + 300} kcal/jour`, 'Surplus controle'],
  ];
  const targetCalories = nutrition.goal === 'loss' ? maintenance - 400 : nutrition.goal === 'gain' ? maintenance + 300 : maintenance;

  const generateNutritionProgram = () => {
    const protein = Math.round(Number(form.weight || 0) * (nutrition.goal === 'gain' ? 2 : 1.7));
    const meals = [
      {
        name: 'Petit dejeuner',
        kcal: Math.round(targetCalories * 0.25),
        content: `Oeufs ou yaourt grec, avoine/pain complet, fruit. Proteines cible: ${Math.round(protein * 0.25)} g.`,
      },
      {
        name: 'Dejeuner',
        kcal: Math.round(targetCalories * 0.35),
        content: `Poulet/poisson/viande maigre, riz/pates/pommes de terre, legumes, huile d olive. Proteines cible: ${Math.round(protein * 0.35)} g.`,
      },
      {
        name: 'Collation',
        kcal: Math.round(targetCalories * 0.15),
        content: 'Fruit + fromage blanc/whey ou sandwich complet leger selon faim et entrainement.',
      },
      {
        name: 'Diner',
        kcal: Math.round(targetCalories * 0.25),
        content: `Source proteinee, legumes, glucides ajustes selon objectif. Proteines cible: ${Math.round(protein * 0.25)} g.`,
      },
    ];
    setMealPlan(meals);
    onProgramWritten?.();
  };

  return (
    <section className={`panel premium-panel ${compact ? 'compact-kcal' : ''} ${nutritionOnly ? 'program-panel-inline' : ''}`}>
      {!nutritionOnly && <div className="panel-heading"><span>Calculateur kcal</span></div>}
      <div className="panel-body">
        {!nutritionOnly && (
          <>
            <div className="form-grid">
              <label>Genre<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="male">Homme</option><option value="female">Femme</option></select></label>
              <label>Age<input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label>
              <label>Taille cm<input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} /></label>
              <label>Poids kg<input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
              <label>Niveau activite<select value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}><option value="low">Faible</option><option value="moderate">Moyen</option><option value="high">Eleve</option></select></label>
              <label>Pas par jour<input type="number" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} /></label>
              <label>Seances muscu / semaine<input type="number" value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} /></label>
              <label>Cardio / semaine<input type="number" value={form.cardio} onChange={(e) => setForm({ ...form, cardio: e.target.value })} /></label>
            </div>
            <MetricGrid cards={[['Maintenance', `${maintenance} kcal`, Activity], ['BMR', `${Math.round(bmr)} kcal`, Heart], ['Sport / jour', `${Math.round(dailyTraining)} kcal`, Dumbbell], ['Pas / jour', `${Math.round(stepsKcal)} kcal`, Users]]} />
            <Rows rows={goalRows} />
          </>
        )}
        {(!compact || nutritionOnly) && (
          <div className="nutrition-program">
            <div className="nutrition-head">
              <div>
                <h2>Programme alimentaire</h2>
                <p>4 repas selon les infos client et l'objectif.</p>
              </div>
              <strong>{Math.round(targetCalories)} kcal / jour</strong>
            </div>
            {nutritionOnly && (
              <div className="form-grid">
                <label>Poids kg<input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
                <label>Niveau activite<select value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}><option value="low">Faible</option><option value="moderate">Moyen</option><option value="high">Eleve</option></select></label>
              </div>
            )}
            <div className="form-grid">
              <label>Client<input value={nutrition.client} onChange={(e) => setNutrition({ ...nutrition, client: e.target.value })} placeholder="Nom du client" /></label>
              <label>Objectif<select value={nutrition.goal} onChange={(e) => setNutrition({ ...nutrition, goal: e.target.value })}><option value="loss">Perte de poids</option><option value="maintain">Maintien</option><option value="gain">Prise de muscle</option></select></label>
            </div>
            <label>Notes client<textarea value={nutrition.notes} onChange={(e) => setNutrition({ ...nutrition, notes: e.target.value })} placeholder="Allergies, aliments preferes, horaires, contraintes..." /></label>
            <button type="button" className="primary-action red" onClick={generateNutritionProgram}>Rediger programme</button>
            {!!mealPlan.length && (
              <div className="meal-grid">
                {mealPlan.map((meal, index) => (
                  <article className="meal-card" key={meal.name}>
                    <div><strong>{meal.name}</strong><span>{meal.kcal} kcal</span></div>
                    <textarea value={meal.content} onChange={(e) => {
                      const next = [...mealPlan];
                      next[index] = { ...meal, content: e.target.value };
                      setMealPlan(next);
                    }} />
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TrainingProgramPanel({ onProgramWritten }) {
  const [training, setTraining] = useState({
    client: '',
    goal: 'muscle',
    level: 'intermediaire',
    days: 4,
    notes: '',
  });
  const [plan, setPlan] = useState([]);

  const generateTrainingProgram = () => {
    const templates = {
      muscle: ['Push: poitrine, epaules, triceps', 'Pull: dos, biceps', 'Jambes: squat, presse, ischios', 'Full body + gainage'],
      loss: ['Circuit full body', 'Cardio intervalles', 'Jambes + core', 'Haut du corps + cardio'],
      strength: ['Squat lourd + assistance', 'Developpe couche + dos', 'Souleve de terre + posterior chain', 'Epaules + bras + gainage'],
    };
    const base = templates[training.goal] || templates.muscle;
    const nextPlan = Array.from({ length: Number(training.days || 1) }, (_, index) => ({
      day: `Jour ${index + 1}`,
      title: base[index % base.length],
      content: `${training.level}: echauffement 10 min, 4 exercices principaux, 3 a 4 series, repos adapte. ${training.notes || 'Adapter les charges selon la technique du client.'}`,
    }));
    setPlan(nextPlan);
    onProgramWritten?.();
  };

  return (
    <div className="training-program">
      <div className="nutrition-head">
        <div>
          <h2>Programme d entrainement</h2>
          <p>Plan coach redige selon objectif, niveau et disponibilite.</p>
        </div>
        <strong>{training.days} jours / semaine</strong>
      </div>
      <div className="form-grid">
        <label>Client<input value={training.client} onChange={(e) => setTraining({ ...training, client: e.target.value })} placeholder="Nom du client" /></label>
        <label>Objectif<select value={training.goal} onChange={(e) => setTraining({ ...training, goal: e.target.value })}><option value="muscle">Prise de muscle</option><option value="loss">Perte de poids</option><option value="strength">Force</option></select></label>
        <label>Niveau<select value={training.level} onChange={(e) => setTraining({ ...training, level: e.target.value })}><option value="debutant">Debutant</option><option value="intermediaire">Intermediaire</option><option value="avance">Avance</option></select></label>
        <label>Jours / semaine<input type="number" min="1" max="6" value={training.days} onChange={(e) => setTraining({ ...training, days: e.target.value })} /></label>
      </div>
      <label>Notes client<textarea value={training.notes} onChange={(e) => setTraining({ ...training, notes: e.target.value })} placeholder="Blessures, exercices interdits, materiel disponible..." /></label>
      <button type="button" className="primary-action red" onClick={generateTrainingProgram}>Rediger programme</button>
      {!!plan.length && (
        <div className="meal-grid">
          {plan.map((item, index) => (
            <article className="meal-card" key={item.day}>
              <div><strong>{item.day}</strong><span>{item.title}</span></div>
              <textarea value={item.content} onChange={(e) => {
                const next = [...plan];
                next[index] = { ...item, content: e.target.value };
                setPlan(next);
              }} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ContractPanel({ user }) {
  return (
    <section className="panel premium-panel contract-panel">
      <div className="contract-hero">
        <ContractIcon size={44} />
        <div>
          <p className="eyebrow premium">Contrat coach</p>
          <h2>{user.name || user.email}</h2>
          <span>Statut actif - Wifak Club Gym</span>
        </div>
      </div>
      <div className="contract-grid">
        <div><strong>Type</strong><span>Contrat coach sportif</span></div>
        <div><strong>Prime inscription</strong><span>25 MAD par inscription cours</span></div>
        <div><strong>Paiement</strong><span>Mensuel</span></div>
        <div><strong>Acces</strong><span>Planning, clients, primes</span></div>
      </div>
    </section>
  );
}

function Shop({ products }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const categories = ['Tous', 'Complements alimentaires', 'Accessoires fitness'];
  const filtered = products.filter((p) => {
    const text = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === 'Tous' || p.category === category);
  });

  const groupedCart = cart.reduce((acc, product) => {
    const existing = acc.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      acc.push({ product, quantity: 1 });
    }
    return acc;
  }, []);

  const total = groupedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const updateQuantity = (productId, delta) => {
    setCart((items) => {
      const next = [...items];
      const index = next.findIndex((product) => product.id === productId);
      if (index === -1) return next;
      const product = next[index];
      if (delta === -1) {
        next.splice(index, 1);
      } else {
        next.splice(index, 0, product);
      }
      return next;
    });
  };

  const addToCart = (product) => {
    setCart((items) => [...items, product]);
  };

  const removeItem = (productId) => {
    setCart((items) => items.filter((item) => item.id !== productId));
  };

  const checkout = async () => {
    if (!cart.length) {
      setCheckoutStatus('Ajoutez au moins un produit au panier avant de valider.');
      return;
    }
    setBusy(true);
    setCheckoutStatus('');
    try {
      const items = groupedCart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));
      const { data } = await api.post('/orders/', {
        items,
        payment_method: paymentMethod,
      });
      setCheckoutStatus(
        data.status === 'paid'
          ? `Commande #${data.id} payee. Merci !`
          : `Commande #${data.id} en attente. Payez a l'accueil pour finaliser.`
      );
      setCart([]);
      setFavorites([]);
    } catch (error) {
      setCheckoutStatus(error.response?.data?.detail || 'Impossible de finaliser la commande.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="shop-section">
      <div className="shop-toolbar glass-dark">
        <div className="search-box"><Search size={18} /><input placeholder="Recherche produits..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="tabs">{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <span className="cart-pill"><ShoppingBag size={16} /> {groupedCart.length} articles</span>
      </div>
      <div className="shop-grid">
        <div className="product-grid">
          {filtered.map((product) => (
            <article className="product-card" key={product.id}>
              <img src={product.image_url} alt={product.name} />
              {product.promo && <span className="badge">Promo</span>}
              <button className={`favorite ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}><Heart size={17} /></button>
              <div><small>{product.brand}</small><h2>{product.name}</h2><p>{product.category}</p></div>
              <div className="product-bottom"><strong>{money(product.price)}</strong><span>Stock {product.stock}</span></div>
              <button className="primary-action red" onClick={() => addToCart(product)}>Ajouter</button>
            </article>
          ))}
        </div>
        <aside className="cart-panel glass-dark">
          <div className="cart-header"><ShoppingBag size={18} /> <strong>Panier</strong></div>
          {!groupedCart.length && <p className="empty">Votre panier est vide.</p>}
          {groupedCart.length > 0 && groupedCart.map((item) => (
            <div className="cart-item" key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <span>{item.quantity} x {money(item.product.price)}</span>
              </div>
              <button className="ghost-action light" onClick={() => removeItem(item.product.id)}>Supprimer</button>
            </div>
          ))}
          <div className="cart-summary">
            <div><span>Total</span><strong>{money(total)}</strong></div>
            <div className="payment-switch">
              <span>Mode de paiement</span>
              <div className="payment-buttons">
                {['card', 'cash'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    className={paymentMethod === method ? 'active' : ''}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === 'card' ? 'Carte bancaire' : 'Reçu à l\'accueil'}
                  </button>
                ))}
              </div>
            </div>
            <p className="help-text">{paymentMethod === 'cash' ? 'Vous recevrez un reçu à présenter à l’accueil pour payer.' : 'Payer immédiatement par carte bancaire.'}</p>
            <button className="primary-action red" disabled={busy} onClick={checkout}>{busy ? 'Traitement...' : 'Valider la commande'}</button>
            {checkoutStatus && <p className="form-status">{checkoutStatus}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Schedule({ sessions, compact, role, user, coaches = [], enrollments = [], onInternalNotify, onCoachBonus, onClientEnroll }) {
  const canManage = ['admin', 'responsable'].includes(role);
  const canEnroll = role === 'client';
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const hours = Array.from({ length: 15 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [hiddenSessionIds, setHiddenSessionIds] = useState([]);
  const [joinedSessionIds, setJoinedSessionIds] = useState([]);
  const [draft, setDraft] = useState({
    title: '',
    type: 'musculation',
    coach_id: '',
    day_of_week: 'lundi',
    start_time: '18:00',
    end_time: '19:00',
    max_capacity: 20,
    description: 'Seance supplementaire',
  });
  const list = (flattenSessions(sessions).length ? flattenSessions(sessions) : flattenSessions(fallbackSchedule))
    .filter((session) => !hiddenSessionIds.includes(session.id));
  const joinedIds = new Set([
    ...joinedSessionIds,
    ...(enrollments || []).map((item) => item.session?.id || item.session_id || item.course?.id).filter(Boolean),
  ]);

  const sessionsAt = (day, hour) => list.filter((session) => {
    const start = session.start_time?.slice(0, 2);
    return session.day === day && start === hour.slice(0, 2);
  });

  const sessionAction = async (session, action) => {
    const endpoint = action === 'cancel' ? 'cancel' : action === 'coach' ? 'notify-coach' : 'notify-clients';
    const fallback = action === 'cancel' ? 'Seance annulee.' : 'Information importante sur la seance.';
    setNotice('Envoi en cours...');
    try {
      const { data } = await api.post(`/sessions/${session.id}/${endpoint}/`, { message: message || fallback });
      setNotice(data.detail || (action === 'cancel' ? 'Seance annulee et notifications envoyees.' : 'Notification envoyee.'));
      onInternalNotify?.(
        action === 'cancel' ? 'Seance annulee' : 'Notification planning',
        message || fallback
      );
      if (action === 'cancel') setHiddenSessionIds((ids) => [...ids, session.id]);
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Action impossible.');
    }
  };

  const addExtraSession = async () => {
    if (!draft.title.trim()) {
      setNotice('Donnez un titre a la seance supplementaire.');
      return;
    }
    setNotice('Ajout de la seance...');
    try {
      await api.post('/sessions/', {
        ...draft,
        coach_id: draft.coach_id || null,
        start_time: draft.start_time.length === 5 ? `${draft.start_time}:00` : draft.start_time,
        end_time: draft.end_time.length === 5 ? `${draft.end_time}:00` : draft.end_time,
      });
      setNotice('Seance supplementaire ajoutee. Notification visible dans l application.');
      onCoachBonus?.('Seance supplementaire ajoutee', 75);
      onInternalNotify?.('Seance supplementaire', `${draft.title} ajoutee au planning.`);
      setDraft({ ...draft, title: '' });
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Impossible d ajouter la seance.');
    }
  };

  const enrollClient = async (session) => {
    if (joinedIds.has(session.id)) {
      setNotice('Vous etes deja inscrit a cette seance.');
      return;
    }
    setNotice('Inscription en cours...');
    const localEnrollment = {
      id: `local-enroll-${session.id}-${Date.now()}`,
      session,
      session_id: session.id,
      member: user,
      created_at: new Date().toISOString(),
      status: 'inscrit',
    };
    try {
      await api.post('/enrollments/', { session_id: session.id });
      setNotice(`Inscription confirmee: ${session.title}.`);
    } catch (error) {
      setNotice(`Inscription locale confirmee: ${session.title}.`);
    }
    setJoinedSessionIds((ids) => [...ids, session.id]);
    onClientEnroll?.(localEnrollment);
    onInternalNotify?.('Inscription seance', `${user?.name || user?.email || 'Client'} inscrit a ${session.title}.`);
  };

  return (
    <Panel title="Calendrier interactif">
      {canEnroll && (
        <div className="class-catalog">
          {list.slice(0, 4).map((session) => (
            <button type="button" key={`catalog-${session.id}`} onClick={() => enrollClient(session)}>
              <strong>{session.title}</strong>
              <span>{session.day} - {session.start_time?.slice(0, 5)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="schedule-tools">
        {canManage && (
          <>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message notification..." />
            <div className="extra-session-form">
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Seance supplementaire" />
              <select value={draft.day_of_week} onChange={(event) => setDraft({ ...draft, day_of_week: event.target.value })}>{days.map((day) => <option key={day} value={day}>{day}</option>)}</select>
              <select value={draft.coach_id} onChange={(event) => setDraft({ ...draft, coach_id: event.target.value })}>
                <option value="">Coach</option>
                {coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.first_name} {coach.last_name}</option>)}
              </select>
              <input type="time" value={draft.start_time} onChange={(event) => setDraft({ ...draft, start_time: event.target.value })} />
              <input type="time" value={draft.end_time} onChange={(event) => setDraft({ ...draft, end_time: event.target.value })} />
              <button type="button" onClick={addExtraSession}>Ajouter</button>
            </div>
          </>
        )}
        {notice && <p className="inline-status action-notice">{notice}</p>}
      </div>
      <div className={compact ? 'timetable compact' : 'timetable'}>
        <div className="time-head">Heure</div>
        {days.map((day) => <div className="day-head" key={day}>{day}</div>)}
        {hours.map((hour) => (
          <div className="time-row" key={hour}>
            <time>{hour}</time>
            {days.map((day) => (
              <div className="time-cell" key={`${day}-${hour}`}>
                {sessionsAt(day, hour).map((session) => (
                  <article className="session-chip" key={session.id}>
                    <strong>{session.title}</strong>
                    <span>{session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}</span>
                    <small>{session.coach?.first_name || 'Coach'} | {session.current_enrollments || 0}/{session.max_capacity}</small>
                    {canEnroll && (
                      <div className="session-actions">
                        <button type="button" disabled={joinedIds.has(session.id)} onClick={() => enrollClient(session)}>
                          {joinedIds.has(session.id) ? 'Inscrit' : 'S inscrire'}
                        </button>
                      </div>
                    )}
                    {canManage && (
                      <div className="session-actions">
                        <button type="button" onClick={() => sessionAction(session, 'coach')}>Coach</button>
                        <button type="button" onClick={() => sessionAction(session, 'clients')}>Clients</button>
                        <button type="button" onClick={() => sessionAction(session, 'cancel')}>Annuler</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ))}
          </div>
        ))}
        {!list.length && <p className="empty">Aucun cours planifie.</p>}
      </div>
    </Panel>
  );
}

function QrPanel({ user }) {
  const qr = user.qr_code || `WIFAK-${user.id || 'CLIENT'}`;
  return (
    <Panel title="QR code membre">
      <div className="qr-box">
        <QrVisual value={qr} />
        <strong>{qr}</strong>
        <span>Scan acces salle active</span>
      </div>
    </Panel>
  );
}

function QrVisual({ value }) {
  const seed = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <div className="qr-visual" aria-label={value}>
      {Array.from({ length: 49 }).map((_, index) => (
        <span key={index} className={(index + seed + Math.floor(index / 3)) % 3 ? 'dark' : ''} />
      ))}
    </div>
  );
}

function ProfileMini({ user }) {
  return (
    <div className="profile-mini">
      <img src={profilePhotoFor(user)} alt={user.name || user.email} />
      <div>
        <strong>{user.name || 'Profil'}</strong>
        <span>{user.email}</span>
      </div>
    </div>
  );
}

function ProfilePanel({ user, role, compact = false }) {
  const qr = user.qr_code || `WIFAK-${user.id || role?.toUpperCase() || 'USER'}`;
  const roleHint = (roles.find((r) => r.id === role) || {}).hint || '';
  return (
    <section className={`panel premium-panel profile-panel ${compact ? 'compact-profile' : ''}`}>
      <div className="profile-cover">
        <img className="profile-photo" src={profilePhotoFor(user)} alt={user.name || user.email} />
        <div>
          <p className="eyebrow premium">Profil {role}</p>
          {roleHint && <small className="role-hint">{roleHint}</small>}
          <h2>{user.name || user.email}</h2>
          <span>{user.email}</span>
        </div>
      </div>
      <div className="profile-details">
        <div><strong>Role</strong><span>{role}</span></div>
        <div><strong>Telephone</strong><span>{user.member?.phone || user.coach?.phone || 'Non renseigne'}</span></div>
        <div><strong>Abonnement</strong><span>{user.member?.subscription_type || 'Interne club'}</span></div>
      </div>
      <div className="profile-qr">
        <QrVisual value={qr} />
        <div><strong>{qr}</strong><span>QR code personnel</span></div>
      </div>
    </section>
  );
}

function ChatPanel({ onInternalNotify }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) {
      setStatus('Ecrivez un message avant l envoi.');
      return;
    }
    onInternalNotify?.('Message interne Wifak Club', message);
    setMessage('');
    setStatus('Message envoye dans les notifications de l application.');
  };

  return (
    <Panel title="Chat interne">
      <div className="chat-box">
        <MessageCircle size={42} />
        <strong>Canal equipe Wifak</strong>
        <p>Le message reste dans l application et s affiche dans Notifications.</p>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ecrire un message..." />
        <button className="primary-action red" onClick={sendMessage}>Envoyer dans l application</button>
        {status && <p className="form-status">{status}</p>}
      </div>
    </Panel>
  );
}

function Panel({ title, children }) {
  return <section className="panel premium-panel"><div className="panel-heading"><span>{title}</span></div><div className="panel-body">{children}</div></section>;
}

function Rows({ rows = [], empty = 'Aucune donnee' }) {
  return <div className="list-rows">{rows.length ? rows.map((row, index) => <div className="mini-row" key={index}><strong>{row[0]}</strong><span>{row[1]}</span><small>{row[2]}</small></div>) : <p className="empty">{empty}</p>}</div>;
}

function Bars({ rows }) {
  const max = Math.max(...rows.map(([, value]) => Number(value) || 1));
  return <div className="bars">{rows.map(([label, value]) => <div className="bar-row" key={label}><div><strong>{label}</strong><span>{value}</span></div><div className="bar-track"><span style={{ width: `${Math.max(8, (Number(value) / max) * 100)}%` }} /></div></div>)}</div>;
}

function ActionSummary({ section }) {
  return (
    <div className="action-grid">
      <button><Activity size={17} /> Live stats</button>
      <button><Lock size={17} /> Permissions</button>
      <button><CalendarDays size={17} /> Calendrier</button>
      <button><BarChart3 size={17} /> Analytics</button>
      <p className="info-note">La section {labelFor(section)} est chargee avec un composant isole, sans anciennes statistiques visibles.</p>
    </div>
  );
}

function LoadingGrid() {
  return <div className="stats-grid">{[1, 2, 3, 4].map((item) => <div className="metric-tile skeleton-tile" key={item} />)}</div>;
}

function flattenSessions(schedule = []) {
  return schedule.flatMap((day) => (day.sessions || []).map((session) => ({ ...session, day: day.day })));
}

function enrollmentName(item = {}) {
  const member = item.member || item.client || item.user || {};
  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
  return fullName || member.name || member.email || item.member_name || item.client_name || 'Client adherent';
}

function labelFor(key) {
  return ({
    profil: 'Profil',
    contrat: 'Contrat',
    analytics: 'Analytics',
    notifications: 'Notifications',
    planning: 'Planning',
    calendrier: 'Calendrier',
    salaires: 'Salaires',
    primes: 'Primes',
    clients: 'Membres',
    coachs: 'Coachs',
    boutique: 'Boutique',
    commandes: 'Commandes',
    offres: 'Offres',
    'coach-overview': 'Dashboard Coach',
    programmes: 'Programmes',
    conges: 'Conges',
    bonus: 'Bonus',
    inscriptions: 'Inscriptions',
    chat: 'Chat interne',
    'responsable-overview': 'Dashboard Responsable',
    'demandes-coach': 'Demandes de Coach',
    'clients-actifs': 'Clients actifs',
    'coachs-jour': 'Coachs du jour',
    qr: 'QR Code',
    'client-overview': 'Dashboard Client',
    paiements: 'Paiements',
    kcal: 'Calcul kcal',
    favoris: 'Favoris',
  }[key] || key);
}

export default App;
