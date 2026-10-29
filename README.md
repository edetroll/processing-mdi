# Interaktív programozás I – Processing

Ez a csomag az első négy kidolgozott fejezetet tartalmazza:

**01 – Ablak és grafikus primitívek**  
**02 – Metódusok és összetett adatszerkezetek**  
**03 – Elágazások**  
**04 – Ciklusok**

A fejezetek a `content/chapters/` mappában találhatók, a navigáció sorrendjét a `content/manifest.json` határozza meg.

A `##` és `###` címsorok automatikusan bekerülnek az oldalsávba.

A folyó szövegben rövid Processing-részletet backtickkel lehet kiemelni, például `mouseX` vagy `size(640, 360)`.

A ritkán használt, egyszerű leíró blokk formája:

~~~markdown
:::leiras title="A gondolatmenet"
1. Első lépés teljes mondatban.
2. Második lépés teljes mondatban.
:::
~~~

Kód + eredmény:

~~~markdown
:::processing-example title="Példa" image="media/pelda.webp"
```processing
void setup() {
  size(640, 360);
}
```

Rövid magyarázat.
:::
~~~

Helyi előnézethez a projekt gyökérmappájában:

```bash
python -m http.server 8000
```

majd böngészőben:

`http://localhost:8000`
