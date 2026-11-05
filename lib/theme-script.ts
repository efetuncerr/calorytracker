export function themeBootScript(savedTheme: string | null) {
  const saved = JSON.stringify(savedTheme);
  return `(function(){try{var key='theme';var stored=localStorage.getItem(key);var fromServer=${saved};var theme=stored||fromServer||'system';if(!stored&&fromServer)localStorage.setItem(key,fromServer);var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=theme==='dark'||(theme!=='light'&&systemDark);var root=document.documentElement;root.classList.toggle('dark',dark);root.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;
}
