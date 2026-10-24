/* Code für die Lehrkraft-Ansicht (index.html?mode=prof) und die Quiz-Lösungen (quiz.html?prof=1).
   Im Quelltext steht nur eine Prüfsumme, nicht der Code selbst. */
(function () {
  "use strict";
  const HASH = "19b5x18skxu";
  const KEY = "pp_prof";
  function hash(code) {
    const str = "pain-perdu|" + String(code || "").toLowerCase().replace(/[\s-]+/g, "");
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function remembered() { try { return sessionStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  window.ppProf = {
    hash,   // neuen Code setzen: in der Browser-Konsole ppProf.hash("neuer code") eingeben, Ergebnis oben bei HASH eintragen
    /* fragt nach dem Code (einmal pro Browser-Tab); true, wenn er stimmt */
    ask(question) {
      if (remembered()) return true;
      const code = window.prompt(question || "Code der Lehrkraft:");
      if (code && hash(code) === HASH) { try { sessionStorage.setItem(KEY, HASH); } catch (e) { /* privat */ } return true; }
      if (code !== null) window.alert("Falscher Code.");
      return false;
    }
  };
})();
