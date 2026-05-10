const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ThemeEngine {
  private currentVersion: string = '';
  private sseConnection: EventSource | null = null;
  private onUpdateCallbacks: (() => void)[] = [];

  // ─────────────────────────────
  // INITIALIZE (called once at app startup)
  // ─────────────────────────────
  async initialize(): Promise<void> {
    await this.fetchAndApply();
    this.connectSSE();
    this.setupSystemListener();
  }

  // ─────────────────────────────
  // FETCH CONFIG FROM API AND APPLY
  // ─────────────────────────────
  async fetchAndApply(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/theme/config`);
      const config = await response.json();

      if (config.version === this.currentVersion) return; // No change
      this.currentVersion = config.version;

      this.injectCSSVariables(config.cssVariables);
      this.applyBrandMetadata(config.brand);
      this.applyFontImport(config.cssVariables['--font-family']);
      this.applyFavicon(config.brand.faviconUrl);
      this.applyDarkModeClass(config.features.defaultMode);

      // Notify React components that theme changed
      this.onUpdateCallbacks.forEach(cb => cb());
    } catch (error) {
      console.warn('[ThemeEngine] Failed to fetch theme config, using defaults');
    }
  }

  // ─────────────────────────────
  // INJECT CSS VARIABLES INTO :root
  // ─────────────────────────────
  private injectCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement; // <html> element

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Force a repaint to ensure all CSS variables are applied
    root.style.display = 'none';
    root.offsetHeight; // trigger reflow
    root.style.display = '';
  }

  // ─────────────────────────────
  // APPLY FONT IMPORT DYNAMICALLY
  // ─────────────────────────────
  private applyFontImport(fontFamily?: string): void {
    const font = fontFamily?.split(',')[0].trim() || 'Inter';
    const googleFontsUrl =
      `https://fonts.googleapis.com/css2?family=${font.replace(/ /g,'+')}:wght@400;500;600;700&display=swap`;

    // Remove old font link if exists
    const existing = document.getElementById('theme-font-link');
    if (existing) existing.remove();

    // Add new font link
    const link = document.createElement('link');
    link.id = 'theme-font-link';
    link.rel = 'stylesheet';
    link.href = googleFontsUrl;
    document.head.appendChild(link);
  }

  // ─────────────────────────────
  // APPLY FAVICON DYNAMICALLY
  // ─────────────────────────────
  private applyFavicon(faviconUrl?: string): void {
    if (!faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl + '?v=' + Date.now(); // cache bust
  }

  // ─────────────────────────────
  // APPLY BRAND METADATA TO <head>
  // ─────────────────────────────
  private applyBrandMetadata(brand: any): void {
    // Update page title
    document.title = `${brand.companyName} — Procurement`;

    // Update meta description
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = `${brand.companyName} Procurement & Finance Management System`;

    // Update theme-color meta (mobile browser toolbar)
    let themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeColor) { themeColor = document.createElement('meta'); themeColor.name = 'theme-color'; document.head.appendChild(themeColor); }
    themeColor.content = brand.loginBgColor || '#0F172A';
  }

  // ─────────────────────────────
  // DARK MODE
  // ─────────────────────────────
  private setupSystemListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const mode = localStorage.getItem('theme-mode') || 'system';
      if (mode === 'system') {
        this.setDarkMode(e.matches);
      }
    });
  }

  private applyDarkModeClass(mode: string): void {
    const root = document.documentElement;
    const isDark = mode === 'dark' ||
       (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme-mode', mode);
  }

  setDarkMode(enabled: boolean): void {
    document.documentElement.classList.toggle('dark', enabled);
  }

  // ─────────────────────────────
  // SSE — REAL-TIME UPDATES
  // ─────────────────────────────
  private connectSSE(): void {
    this.sseConnection = new EventSource(`${API_URL}/events`);

    this.sseConnection.addEventListener('theme_updated', () => {
      console.log('✨ Theme update received via SSE');
      this.fetchAndApply();
    });

    this.sseConnection.addEventListener('ping', () => {
      // Just to keep connection alive
    });

    this.sseConnection.onerror = () => {
      this.sseConnection?.close();
      setTimeout(() => this.connectSSE(), 5000);
    };
  }

  // ─────────────────────────────
  // SUBSCRIBE TO THEME CHANGES (for React)
  // ─────────────────────────────
  onUpdate(callback: () => void): () => void {
    this.onUpdateCallbacks.push(callback);
    return () => { // unsubscribe function
      this.onUpdateCallbacks = this.onUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  // ─────────────────────────────
  // GET CURRENT VALUES (for React components)
  // ─────────────────────────────
  getVar(variable: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable).trim();
  }
}

export const themeEngine = new ThemeEngine();
