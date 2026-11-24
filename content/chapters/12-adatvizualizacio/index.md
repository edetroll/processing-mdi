# Adatok vizuális megjelenítése

A programban előállított geometriai adatok mellett **mért és megfigyelt adatokkal** is dolgozhatunk. Ilyenkor az alakzatok helye, mérete és színe valamilyen mennyiséget jelöl. Az ábrázolásnak ezért értelmezhetőnek kell lennie: világosan meg kell adni, mit jelölnek a tengelyek, milyen mértékegységeket használunk, és honnan származnak az adatok.

A fejezet a szöveges fájlok beolvasásától a valódi adatok 2D-s és 3D-s megjelenítéséig jut el. A programok a csomagban található CSV-fájlokkal futtathatók; a `data` mappába helyezésüket minden érintett példánál jelöljük.

## Szöveges és CSV-fájlok beolvasása {#beolvasas}

A `loadStrings()` egy szövegfájl sorait olvassa be `String[]` tömbbe. A `float()` a számként tárolt szöveget alakítja át numerikus értékké. Az első gyakorló fájl 12 sorból áll; a számok **kitalált, kizárólag a fájlbeolvasás szemléltetésére használt adatok**, nem valós látogatottsági statisztikák.

A fájlt a Processing-vázlat `data/havi-latogatok.txt` útvonalán kell elhelyezni. A rajzolás előtt először keressük meg a legnagyobb értéket, hogy a téglalapok hossza arányos legyen.

:::processing-example title="Szövegfájl beolvasása és oszlopdiagram" image="media/01-szovegfajl.webp"
```processing
void setup() {
  size(880, 560);
  background(14, 23, 37);
  String[] lines = loadStrings("havi-latogatok.txt");
  float[] values = new float[lines.length];
  float maximum = 0;

  for (int i = 0; i < lines.length; i++) {
    values[i] = float(trim(lines[i]));
    maximum = max(maximum, values[i]);
  }

  noStroke();
  for (int i = 0; i < values.length; i++) {
    float y = 64 + i*39;
    float barWidth = map(values[i], 0, maximum, 0, 650);
    fill(55, 169, 194);
    rect(110, y, barWidth, 25);
  }
}
```
:::

A következő lépés a **CSV-formátum**. A táblázat első sora megadja az oszlopneveket, a további sorok az adatokat. A `loadTable("fájlnév.csv", "header")` a fejlécet is feldolgozza, ezért az adatokat az oszlopok neve alapján kérhetjük le (`getInt`, `getFloat`). A fájlnak itt is a Processing-vázlat `data` mappájában kell lennie. [Processing: `loadTable()`](https://processing.org/reference/loadTable_)

A fejezetben a `nasa-gistemp-2010-2024.csv` fájlt használjuk. A `year` az évet, a `jan`–`dec` oszlopok a havi eltéréseket, az `avg` a tizenkét kerekített havi értékből képzett számtani átlagot tartalmazza. A hőmérsékleti eltérések az **1951–1980-as bázisidőszak átlagához** viszonyított Celsius-fok értékek, nem a hónapok átlaghőmérsékletei.

**Forrás:** [NASA GISS GISTEMP v4](https://data.giss.nasa.gov/gistemp/data_v4.html). A mellékelt, 2010–2024 közötti tanítási kivonat a NASA adatait közlő [GISTEMP Viewer](https://nasa-gistemp-viewer.vercel.app/en) nyilvános táblázatának archivált értékeiből készült; a NASA adatbázisát utólag is frissíthetik. A `avg` oszlop saját számítás, nem az eredeti NASA `J-D` oszlop.

:::processing-example title="CSV-adatokból készített éves oszlopdiagram" image="media/02-eves-oszlop.webp"
```processing
Table data;

void setup() {
  size(920, 600);
  data = loadTable("nasa-gistemp-2010-2024.csv", "header");
  background(13, 21, 35);
  noStroke();
  float maxValue = 1.4;

  for (int i = 0; i < data.getRowCount(); i++) {
    TableRow row = data.getRow(i);
    float value = row.getFloat("avg");
    float x = 95 + i*49;
    float barHeight = map(value, 0, maxValue, 0, 410);
    fill(66, 170, 199);
    rect(x, 505-barHeight, 31, barHeight);
  }
  fill(225, 233, 239);
  textSize(13);
  textAlign(CENTER);
  for (int i = 0; i < data.getRowCount(); i += 2) {
    text(data.getRow(i).getInt("year"), 110 + i*49, 532);
  }
  textAlign(LEFT);
  text("NASA GISTEMP – éves eltérés (°C)", 95, 47);
}
```
:::

A program a `getRowCount()` segítségével határozza meg a sorok számát. A `getRow(i)` az adott év sorát adja vissza. A `map()` az eltérésértékeket pixelben mért oszlopmagassággá alakítja. A felhasznált maximumot ebben az első példában még kézzel adjuk meg; általánosabb programban a minimum és maximum a fájlból számítható.

## Síkbeli megjelenítések {#sikbeli}

Ugyanaz a mérési sor különböző ábrázolásokkal eltérő kérdések megválaszolására alkalmas. Az idősor a változás irányát, a hőtérkép a hónapok közötti eltéréseket mutatja. A színskálát és a tengelyek jelentését ezért tudatosan kell megválasztani.

:::processing-example title="Éves eltérések vonaldiagramon" image="media/03-vonaldiagram.webp"
```processing
Table data;

void setup() {
  size(920, 600);
  data = loadTable("nasa-gistemp-2010-2024.csv", "header");
  background(13, 21, 35);
  stroke(93, 202, 216);
  strokeWeight(3);
  noFill();

  int count = data.getRowCount();
  beginShape();
  for (int i = 0; i < count; i++) {
    float value = data.getRow(i).getFloat("avg");
    float x = map(i, 0, count-1, 90, 830);
    float y = map(value, 0, 1.4, 515, 100);
    vertex(x, y);
  }
  endShape();

  noStroke();
  fill(235, 165, 105);
  for (int i = 0; i < count; i++) {
    float value = data.getRow(i).getFloat("avg");
    float x = map(i, 0, count-1, 90, 830);
    float y = map(value, 0, 1.4, 515, 100);
    circle(x, y, 7);
  }
  fill(222, 231, 238);
  textSize(13);
  textAlign(CENTER);
  for (int i = 0; i < count; i += 2) {
    float x = map(i, 0, count-1, 90, 830);
    text(data.getRow(i).getInt("year"), x, 545);
  }
  textAlign(LEFT);
  text("Éves hőmérsékleti eltérés (°C)", 90, 54);
  for (float value = 0.4; value <= 1.21; value += 0.2) {
    float y = map(value, 0, 1.4, 515, 100);
    text(nf(value, 0, 1), 45, y + 4);
  }
}
```
:::

A pontokat a `vertex()` segítségével egy vonallá kapcsoljuk össze. A második ciklus külön megrajzolja az egyes éveket jelölő pontokat. Az idősorban a vízszintes tengely az évet, a függőleges tengely a hőmérsékleti eltérést jelenti. Egy végleges statisztikai ábrán a tengelyfeliratoknak és a jelmagyarázatnak is szerepelnie kell.

:::processing-example title="Havi eltérések hőtérképen" image="media/04-hotermekep.webp"
```processing
Table data;
String[] months = {"jan","feb","mar","apr","may","jun",
                   "jul","aug","sep","oct","nov","dec"};

void setup() {
  size(980, 600);
  data = loadTable("nasa-gistemp-2010-2024.csv", "header");
  background(13, 21, 35);
  noStroke();

  int count = data.getRowCount();
  float cellW = 51;
  float cellH = 29;
  for (int i = 0; i < count; i++) {
    TableRow row = data.getRow(i);
    for (int m = 0; m < 12; m++) {
      float a = row.getFloat(months[m]);
      fill(tempColor(a));
      rect(95 + i*cellW, 100 + m*cellH, cellW-2, cellH-2);
    }
  }
  fill(228, 235, 242);
  textSize(12);
  textAlign(RIGHT, CENTER);
  for (int m = 0; m < 12; m++) {
    text(months[m], 87, 114 + m*cellH);
  }
  textAlign(CENTER);
  for (int i = 0; i < count; i += 2) {
    text(data.getRow(i).getInt("year"), 118 + i*cellW, 474);
  }
  textAlign(LEFT);
  text("Havi hőmérsékleti eltérés (°C), NASA GISTEMP", 95, 65);
  for (int k = 0; k <= 100; k++) {
    float a = map(k, 0, 100, 0.35, 1.5);
    stroke(tempColor(a));
    line(250 + k*4, 527, 250 + k*4, 544);
  }
  noStroke();
  fill(228, 235, 242);
  text("0.35", 235, 564);
  text("1.50 °C", 635, 564);
}

color tempColor(float anomaly) {
  float t = constrain(map(anomaly, 0.35, 1.5, 0, 1), 0, 1);
  return lerpColor(color(68, 135, 197), color(234, 100, 81), t);
}
```
:::

A hőtérkép minden cellája egyetlen hónapot jelöl: az oszlopok az éveket, a sorok a hónapokat. A `lerpColor()` két szín között interpolál, a `constrain()` pedig a megadott tartományra korlátozza az értéket. **A színskála megválasztása az ábrázolás része**: itt a kék és a vörös alacsonyabb, illetve magasabb eltérést jelent a kiválasztott időszak **saját tartományán belül**. Nem jelölünk vele abszolút hideg és meleg hónapokat, és a nulla körüli eltérésekhez egy másik, középpontos színskála lenne alkalmasabb.

## Térbeli adatábrázolás {#terbeli}

A képletekből számított felületeknél az előző fejezetben a `heightAt(x, y)` eredménye szolgáltatta a magasságot. Most ugyanez a szerep jut a **CSV egyik cellájának**. Az első vízszintes irány az éveket, a második a hónapokat, a harmadik pedig a hőmérsékleti eltérést képviseli.

A felület itt **nem a Föld felszínét** és nem földrajzi magasságot ábrázol. Egy év–hónap–eltérés adatmátrix háromdimenziós megjelenítése. A sorok és oszlopok közötti interpolált felület az ábra része, nem új mérési eredmény.

:::processing-example title="Havi hőmérsékleti adatok térbeli felületként" image="media/05-adatfelulet.webp"
```processing
Table data;
String[] months = {"jan","feb","mar","apr","may","jun",
                   "jul","aug","sep","oct","nov","dec"};

void setup() {
  size(960, 660, P3D);
  data = loadTable("nasa-gistemp-2010-2024.csv", "header");
}

void draw() {
  background(13, 21, 35);
  lights();
  translate(width/2, height/2, 0);
  rotateX(0.95);
  rotateZ(-0.55 + (mouseX-width/2)*0.0006);
  noStroke();

  int count = data.getRowCount();
  float dx = 37;
  float dy = 34;
  for (int i = 0; i < count-1; i++) {
    TableRow a = data.getRow(i);
    TableRow b = data.getRow(i+1);
    beginShape(QUAD_STRIP);
    for (int m = 0; m < 12; m++) {
      float za = a.getFloat(months[m]);
      float zb = b.getFloat(months[m]);
      float x0 = (i-(count-1)/2.0)*dx;
      float x1 = ((i+1)-(count-1)/2.0)*dx;
      float y = (m-5.5)*dy;
      fill(tempColor(za));
      vertex(x0, y, (za-0.65)*230);
      fill(tempColor(zb));
      vertex(x1, y, (zb-0.65)*230);
    }
    endShape();
  }
}

color tempColor(float anomaly) {
  float t = constrain(map(anomaly, 0.35, 1.5, 0, 1), 0, 1);
  return lerpColor(color(61, 134, 199), color(244, 120, 78), t);
}
```
:::

A kód a `QUAD_STRIP` segítségével köti össze a két szomszédos **évsor** megfelelő hónapjait. A z koordináta `230`-as szorzója vizuális függőleges nyújtást jelent, nem hőmérsékleti átszámítást. Az egér vízszintes mozgása a nézetet forgatja. Fontos észrevenni, hogy a perspektíva, a takarás és a nézőpont miatt a pontos értékek leolvasása nehezebb lehet, mint a 2D-s hőtérképen.

## Kidolgozott példa – földrengések térbeli eloszlása {#foldrengesek}

A második példa nem szabályos felületet, hanem sok **önálló adatpontot** jelenít meg. A földrengésekhez általában földrajzi szélesség, hosszúság, mélység és magnitúdó tartozik. A vizualizációban a helyet a koordináták, a méretet a magnitúdó, a mélységet pedig a harmadik térbeli irány jelöli.

A mellékelt `foldrengesek-minta.csv` **mesterséges, oktatási célra előállított adatokat tartalmaz**. Nem USGS-mérések, és belőlük földtudományi következtetés nem vonható le. A programot ezen a kis fájlon lehet azonnal kipróbálni, majd a [USGS hivatalos CSV-letöltéséből](https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php) származó adatokkal is meg lehet tölteni. Ehhez a `latitude`, `longitude`, `depth` és `mag` mezőket az alábbi kódban használt oszlopnevekhez kell igazítani. A USGS eseménylistájának keresési feltételeit (időszak, terület, minimum magnitúdó) az ábrázolás mellett dokumentálni kell.

:::processing-example title="Földrengések 1. – epicentrumok síkbeli elhelyezkedése" image="media/06-rengesek-2d.webp"
```processing
Table data;

void setup() {
  size(960, 580);
  data = loadTable("foldrengesek-minta.csv", "header");
  background(12, 23, 39);
  noStroke();

  for (TableRow row : data.rows()) {
    float lat = row.getFloat("latitude");
    float lon = row.getFloat("longitude");
    float magnitude = row.getFloat("magnitude");

    // Equirectangularis vetulet, nem pontos terkepeszeti vetites.
    float x = map(lon, -180, 180, 55, 905);
    float y = map(lat, 90, -90, 40, 540);
    float diameter = map(magnitude, 4.5, 8.0, 6, 27);
    fill(244, 132, 95, 180);
    circle(x, y, diameter);
  }
  stroke(55, 84, 105);
  strokeWeight(1);
  for (int lon = -180; lon <= 180; lon += 60) {
    float x = map(lon, -180, 180, 55, 905);
    line(x, 40, x, 540);
  }
  for (int lat = -60; lat <= 60; lat += 30) {
    float y = map(lat, 90, -90, 40, 540);
    line(55, y, 905, y);
  }
  fill(220, 232, 241);
  textSize(13);
  text("Földrajzi hosszúság (°)", 375, 568);
  text("Földrajzi szélesség / mag. (mintadatok)", 55, 25);
}
```
:::

A `map()` itt egy egyszerű, **ekvirektanguláris** koordináta-ábrázolást valósít meg: a földrajzi hosszúság vízszintes, a szélesség függőleges irányban jelenik meg. Ez szemléltetési célra használható, de a pólusok felé jelentős terület- és távolságtorzítás lép fel. A körátmérőt itt a magnitúdóhoz rendeljük; a magnitúdó logaritmikus jellegű földrengésméret-mérőszám, ezért a kör mérete nem olvasható közvetlenül energiaarányként.

:::processing-example title="Földrengések 2. – pontok három koordinátával" image="media/07-rengesek-3d.webp"
```processing
Table data;

void setup() {
  size(960, 660, P3D);
  data = loadTable("foldrengesek-minta.csv", "header");
  sphereDetail(8);
}

void draw() {
  background(12, 23, 39);
  lights();
  translate(width/2, height/2, 0);
  rotateX(0.9);
  rotateZ(-0.22 + (mouseX-width/2)*0.001);

  stroke(54, 81, 105);
  noFill();
  rectMode(CENTER);
  rect(0, 0, 750, 380);
  noStroke();

  for (TableRow row : data.rows()) {
    float lat = row.getFloat("latitude");
    float lon = row.getFloat("longitude");
    float depth = row.getFloat("depth");
    float mag = row.getFloat("magnitude");
    float x = map(lon, -180, 180, -375, 375);
    float y = map(lat, 90, -90, -190, 190);
    float z = -min(depth, 450)*0.6;

    pushMatrix();
    translate(x, y, z);
    fill(240, 148, 103);
    sphere(map(mag, 4.5, 8.0, 4, 15));
    popMatrix();
  }
}
```
:::

A mintában a `depth` pozitív mélységet jelöl kilométerben, ezért a kódban negatív z koordinátává alakítjuk: a felszínt a \(z=0\) sík jelöli. A `min(depth,450)` és a `0.6` megjelenítési korlátot és skálát adnak; ezek nem változtatják meg az eredeti CSV-t. A pontok térbeli értelmezéséhez mindig jelezni kell a használt mélységskálát. Valós USGS-adatok esetén a forrás, a lekérdezés időpontja és a szűrés feltételei is a dokumentáció részei.

A fejezet programjai azt mutatják, hogy ugyanabból az adatsorból több ábrázolás készíthető. Az egyes ábrázolások használhatóságát nem csupán a látvány határozza meg: azt is mérlegelni kell, milyen összehasonlítást szeretnénk lehetővé tenni, és az adat mely tulajdonságait fontos megőrizni.

