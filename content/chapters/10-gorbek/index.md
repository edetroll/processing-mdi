# Görbék

A korábbi fejezetekben az alakzatok helyét többnyire közvetlen koordinátákkal adtuk meg. Görbék esetén a pontok koordinátáit **függvényekből is kiszámíthatjuk**. Ez nemcsak vonalak rajzolására használható: a görbe megadhatja egy mozgó objektum pályáját, vagy azt, hogy sok kisebb alakzat hova kerüljön egy kompozícióban.

Ebben a fejezetben a paraméteres leírás alapgondolatára és a felhasználására koncentrálunk. A függvények matematikai tulajdonságait nem vizsgáljuk részletesen; elsősorban a változtatható paraméterek és a keletkező kép kapcsolatát figyeljük meg.

## Paraméteres görbék {#parameteres-gorbek}

A síkbeli paraméteres görbe egy pontját két függvény határozza meg: **`x(t)` és `y(t)`**. A `t` értékét egy megadott tartományon változtatjuk, minden értékhez kiszámítunk egy pontot, majd az egymást követő pontokat összekötjük. Ha elég sok pontot számítunk, a vonal folyamatos görbének látszik.

**Általános rajzolóprogram.** A következő programban a `curveX()` és `curveY()` függvények, valamint a `tMin`, `tMax` értékek cserélhetők. A ciklus és a rajzolás szerkezete változatlan marad. Az első példa egy Lissajous-görbét rajzol.

:::processing-example title="Paraméteres görbe – újrahasználható 2D-s programváz" image="media/01-lissajous.webp"
```processing
float tMin = 0;
float tMax = TWO_PI;
int steps = 1200;

void setup() {
  size(800, 600);
  background(13, 20, 34);

  translate(width / 2, height / 2);
  noFill();
  stroke(110, 205, 245);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, tMin, tMax);
    vertex(curveX(t), curveY(t));
  }
  endShape();
}

float curveX(float t) {
  return 240 * sin(3 * t);
}

float curveY(float t) {
  return 180 * sin(4 * t + PI / 2);
}
```
:::

A `map()` a ciklusváltozó `0` és `steps` közötti értékeit a megadott paramétertartományra képezi le. A `beginShape()` és az `endShape()` közötti `vertex(x, y)` hívások egymás után adják meg a görbe közelítő pontjait. A `steps` a mintavételezés sűrűségét szabályozza: kevés értéknél a vonal szögletesebb, több értéknél simább lesz. A két szinuszfüggvényben a `3`, `4` és a `PI / 2` az alakját befolyásolja; ezek megváltoztatásával más Lissajous-mintát kapunk.

### Görbék különböző függvényekből

Néhány ismert görbén jól megfigyelhető, mennyire eltérő képet adhat ugyanaz a rajzolási módszer. Az alábbi kódok mind önálló programok, de mindegyik a fenti eljárást használja.

**Rózsagörbe.** A `petals` paraméter a mintázat sziromszerkezetét határozza meg. Először kiszámítjuk a középponttól mért távolságot (`r`), majd ebből a pont két koordinátáját.

:::processing-example title="Rózsagörbe – változtatható alakparaméter" image="media/02-rozsagorbe.webp"
```processing
float petals = 7;
int steps = 1400;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(245, 145, 185);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float r = 245 * cos(petals * t);
    float x = r * cos(t);
    float y = r * sin(t);
    vertex(x, y);
  }
  endShape();
}
```
:::

**Spirograph-jellegű görbe (hipotrochoid).** Az alakot három paraméterrel adjuk meg: `R` a nagyobb, `r` a kisebb kör sugara, `d` pedig a rajzolópont távolsága a kisebb kör középpontjától. Itt a paramétertartomány is lényeges: nem minden görbe záródik egyetlen körbefordulás után.

:::processing-example title="Hipotrochoid – három alakparaméterrel" image="media/03-hipotrochoid.webp"
```processing
float R = 180;
float r = 40;
float d = 105;
int steps = 1800;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(245, 196, 104);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, 2 * TWO_PI);
    float k = (R - r) / r;
    float x = (R - r) * cos(t) + d * cos(k * t);
    float y = (R - r) * sin(t) - d * sin(k * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

**Archimédészi spirál.** A paraméter növelésével a sugár is folyamatosan nő. Ha a `turns` értékét módosítjuk, több vagy kevesebb fordulatot kapunk; a `growth` az egymást követő menetek távolságát befolyásolja.

:::processing-example title="Archimédészi spirál" image="media/04-spiral.webp"
```processing
int turns = 7;
float growth = 5.2;
int steps = 1800;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(118, 220, 178);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, turns * TWO_PI);
    float r = growth * t;
    vertex(r * cos(t), r * sin(t));
  }
  endShape();
}
```
:::

A négy példánál érdemes először csak egy-egy paramétert módosítani, és megnézni, hogyan változik a görbe. A kódban a számításokat nem kell levezetnünk: azt kell érteni, **melyik paramétert változtatjuk, és az hogyan hat a rajzra**.

## Görbék alkalmazása {#alkalmazasok}

A görbe pontjaihoz nemcsak vonalszakaszokat rajzolhatunk. Ugyanezekre a koordinátákra köröket, négyzeteket vagy képeket is helyezhetünk. A `t` paraméter akár a rajzolt alakzat méretét, forgatását és színét is szabályozhatja.

**Alakzatok elhelyezése.** Az első program egy Lissajous-görbe mentén színes köröket rajzol. A méret minden mintavételi pontnál más: a `sin(t)` függvény határozza meg, milyen nagy legyen az adott kör.

:::processing-example title="Változó méretű körök egy görbe mentén" image="media/05-korok-gorben.webp"
```processing
void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);
  noStroke();

  int count = 180;
  for (int i = 0; i < count; i++) {
    float t = map(i, 0, count, 0, TWO_PI);
    float x = 240 * sin(3 * t);
    float y = 180 * sin(4 * t + PI / 2);
    float diameter = 5 + 9 * (1 + sin(7 * t)) / 2;

    fill(95 + 120 * i / count,
         145 + 65 * sin(t), 230, 170);
    circle(x, y, diameter);
  }
}
```
:::

**Forgatott négyzetek.** Ugyanarra a pályára négyzeteket helyezünk. A korábban tanult `pushMatrix()` és `popMatrix()` biztosítja, hogy minden négyzet saját helyen és szögben rajzolódjon ki. A `rotate()` szöge és a `scale()` méretezése is a `t` paraméterből származik.

:::processing-example title="A görbe mentén forgó és méretezett négyzetek" image="media/06-negyzetek-gorben.webp"
```processing
void setup() {
  size(800, 600);
  background(13, 20, 34);
  rectMode(CENTER);
  noFill();
  strokeWeight(2);
  translate(width / 2, height / 2);

  int count = 120;
  for (int i = 0; i < count; i++) {
    float t = map(i, 0, count, 0, TWO_PI);
    float x = 235 * cos(t);
    float y = 170 * sin(t);
    float s = 0.7 + 0.35 * sin(5 * t);

    pushMatrix();
    translate(x, y);
    rotate(2 * t);
    scale(s);
    stroke(110 + i, 180, 245, 170);
    rect(0, 0, 34, 34);
    popMatrix();
  }
}
```
:::

A négyzetek nem egyetlen kész alakzat másolatai a képen: minden cikluslépésben újból meghatározzuk a helyüket, méretüket és irányukat. Ugyanez az eljárás alkalmazható képek elhelyezésére is az `image()` rajzoló utasítással.

**Kontrollpontokkal megadott görbék.** Nem minden esetben szeretnénk a koordinátafüggvényeket kézzel megadni. A Processing `bezier()` metódusa négy pont segítségével határoz meg egy Bézier-görbét: a két végpontot és a két kontrollpontot. A következő példában az egyik kontrollpont az egérrel mozgatható, ezért azonnal látható, hogyan módosul a görbe alakja.

:::processing-example title="Bézier-görbe mozgatható kontrollponttal" image="media/07-bezier.webp"
```processing
void setup() {
  size(800, 550);
  strokeWeight(3);
}

void draw() {
  background(16, 25, 40);

  stroke(86, 110, 135);
  strokeWeight(1);
  line(90, 420, 260, 110);
  line(mouseX, mouseY, 710, 120);

  noFill();
  stroke(105, 215, 215);
  strokeWeight(4);
  bezier(90, 420,
         260, 110,
         mouseX, mouseY,
         710, 120);

  noStroke();
  fill(250, 175, 100);
  circle(260, 110, 14);
  circle(mouseX, mouseY, 14);
}
```
:::

Az első és az utolsó pont a görbe végpontja, a közbenső pontok pedig befolyásolják az alakját. A `curve()` és a `curveVertex()` egy másik, Catmull–Rom-típusú görbéhez használható. Ezeket most nem vezetjük le; a kontrollpontok szerepének megértése elegendő.

## Térbeli görbék {#terbeli-gorbek}

Térben ugyanaz a módszer működik, mint síkban, csak a pontnak **harmadik koordinátája is van**. A görbe egy pontját így `x(t)`, `y(t)` és `z(t)` határozza meg. A `P3D` megjelenítési módot használjuk, és a `vertex()` már három értéket kap.

**Általános térbeli programváz.** A következő program egy csavarvonalat rajzol. A térbeli görbe alakja a három `curveX()`, `curveY()` és `curveZ()` függvény, valamint a paramétertartomány cseréjével változtatható.

:::processing-example title="Csavarvonal – újrahasználható 3D-s programváz" image="media/08-csavarvonal.webp"
```processing
float tMin = 0;
float tMax = 6 * PI;
int steps = 1200;

void setup() {
  size(850, 600, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.6);
  rotateY(frameCount * 0.006);

  noFill();
  stroke(110, 215, 245);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, tMin, tMax);
    vertex(curveX(t), curveY(t), curveZ(t));
  }
  endShape();
}

float curveX(float t) { return 135 * cos(t); }
float curveY(float t) { return 135 * sin(t); }
float curveZ(float t) { return -210 + 22 * t; }
```
:::

A `curveX()` és `curveY()` körmozgást írnak le, miközben a `curveZ()` folyamatosan változik; ettől alakul ki a csavarvonal. A teljes jelenetet lassan forgatjuk, hogy a térbeli forma könnyebben áttekinthető legyen.

**Tóruszcsomó.** Egy térben önmagába visszatérő görbét is létrehozhatunk. A `p` és `q` alakparaméterek azt befolyásolják, hogyan járja körbe a görbe a tórusz alakú tartományt. A program nem egy tóruszfelületet rajzol, hanem egyetlen térbeli vonalat.

:::processing-example title="Tóruszcsomó – térbeli görbe alakparaméterekkel" image="media/09-toruszcsomo.webp"
```processing
float p = 2;
float q = 3;
int steps = 1500;

void setup() {
  size(850, 600, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.5);
  rotateY(frameCount * 0.005);
  noFill();
  stroke(245, 155, 190);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float a = 180 + 68 * cos(q * t);
    float x = a * cos(p * t);
    float y = a * sin(p * t);
    float z = 68 * sin(q * t);
    vertex(x, y, z);
  }
  endShape();
}
```
:::

A térbeli görbe mentén gömböket is elhelyezhetünk. A következő programban az egyes gömbök helyét ugyanaz a tóruszcsomó adja meg, amelyet az előző kódban vonalként rajzoltunk meg.

:::processing-example title="Gömbök elhelyezése egy térbeli görbe mentén" image="media/10-gombok-terben.webp"
```processing
void setup() {
  size(850, 600, P3D);
  sphereDetail(8);
}

void draw() {
  background(10, 16, 29);
  lights();
  translate(width / 2, height / 2, 0);
  rotateX(-0.5);
  rotateY(frameCount * 0.005);
  noStroke();

  int count = 90;
  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;
    float a = 180 + 68 * cos(3 * t);
    float x = a * cos(2 * t);
    float y = a * sin(2 * t);
    float z = 68 * sin(3 * t);

    pushMatrix();
    translate(x, y, z);
    fill(105 + i, 125 + i / 2, 230);
    sphere(5 + 4 * (1 + sin(5 * t)) / 2);
    popMatrix();
  }
}
```
:::

### Csavarodó keresztmetszetek egy görbe mentén

A görbe mentén elhelyezett alakzatot a helyváltoztatás mellett **folyamatosan forgathatjuk vagy méretezhetjük** is. Ennek egyszerű szemléltetése egy körpálya mentén elhelyezett négyzetek sora. A négyzetek síkját először a körpálya érintőjére merőlegesen állítjuk, majd a teljes körbejárás alatt mindegyiket egyre nagyobb szögben elforgatjuk a helyi érintő körül.

:::processing-example title="Kör mentén csavarodó négyzet-keresztmetszetek" image="media/11-csavart-keresztmetszet.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);

  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  int count = 150;
  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;

    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateY(t);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

A `rotateZ(t)` és az eltolás a négyzetet a körpályára viszi. A `rotateX(HALF_PI)` a keresztmetszet síkját a pályára merőlegesen állítja. A közéjük írt `rotateY(t)` a keresztmetszetet a **helyi érintő iránya körül** forgatja. A kétféle forgatás így eltérő feladatot végez: az egyik a pálya menti elhelyezést, a másik a keresztmetszet saját csavarodását hozza létre. A program keresztmetszeteket rajzol, nem hoz létre köztük folytonos felületet.

## Kidolgozott példák {#kidolgozott-peldak}

A fejezet végén két összetettebb alkotást készítünk. Az első síkbeli vonalrendszer, a második térbeli, csavarodó geometrikus kompozíció. Mindkettőt több, önállóan futtatható változatban építjük fel.

### 1. Paraméteres vonalkompozíció

A kiindulás egy lassan csillapodó Lissajous-jellegű görbe. A `damping` tényezővel a koordináták nagyságát csökkentjük, így a görbe fokozatosan közelít a középponthoz. A további változatokban egymáshoz közeli paraméterű görbéket rajzolunk egymásra.

**1. változat – egyetlen csillapodó görbe.**

:::processing-example title="Paraméteres kompozíció – 1. változat" image="media/12-vonalkompozicio-1.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  stroke(112, 205, 245);
  strokeWeight(1.5);

  beginShape();
  for (int i = 0; i <= 2400; i++) {
    float t = map(i, 0, 2400, 0, 12 * PI);
    float damping = exp(-0.045 * t);
    float x = 245 * damping * sin(3 * t + 0.3);
    float y = 205 * damping * sin(4 * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

Az `exp(-0.045 * t)` értéke a `t` növekedésével csökken. Ezzel a görbe egyre kisebb kitéréseket végez; a `0.045` megváltoztatásával a csillapodás gyorsaságát szabályozhatjuk.

**2. változat – több, kissé eltérő görbe.** A külső ciklus többször rajzolja meg a mintát, de a `phase` értéke minden alkalommal más lesz.

:::processing-example title="Paraméteres kompozíció – 2. változat" image="media/13-vonalkompozicio-2.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(1.2);

  for (int k = 0; k < 10; k++) {
    float phase = k * 0.055;
    stroke(110, 190, 245, 95);

    beginShape();
    for (int i = 0; i <= 1800; i++) {
      float t = map(i, 0, 1800, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = 245 * damping * sin(3 * t + phase);
      float y = 205 * damping * sin(4 * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
}
```
:::

**3. változat – színváltoztatás.** A színkomponensek a `k` ciklusváltozó szerint módosulnak, a vonalak áttetszősége pedig lehetővé teszi, hogy az egymásra kerülő szakaszok együtt gazdagabb tónusokat alkossanak.

:::processing-example title="Paraméteres kompozíció – 3. változat" image="media/14-vonalkompozicio-3.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(1.2);

  for (int k = 0; k < 13; k++) {
    float phase = k * 0.06;
    stroke(80 + k * 12, 200 - k * 6, 245, 88);

    beginShape();
    for (int i = 0; i <= 1800; i++) {
      float t = map(i, 0, 1800, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = 245 * damping * sin(3 * t + phase);
      float y = 205 * damping * sin(4 * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
}
```
:::

**4. változat – több motívumból álló kompozíció.** A rajzolást saját metódusba szervezzük. A `drawMotif()` megkapja a középpontot, a méretet, a két frekvenciát és az alapszínt. Ugyanaz a megoldás három eltérő helyen készít mintázatot.

:::processing-example title="Paraméteres kompozíció – 4. változat" image="media/15-vonalkompozicio-4.webp"
```processing
void setup() {
  size(950, 620);
  background(10, 15, 29);
  noFill();

  drawMotif(245, 285, 185, 155, 3, 4,
            color(125, 205, 245));
  drawMotif(690, 260, 175, 170, 4, 5,
            color(245, 150, 185));
  drawMotif(475, 425, 165, 115, 5, 6,
            color(240, 205, 105));
}

void drawMotif(float cx, float cy,
               float ax, float ay,
               float fx, float fy, color c) {
  pushMatrix();
  translate(cx, cy);
  strokeWeight(1.15);

  for (int k = 0; k < 10; k++) {
    float phase = k * 0.06;
    stroke(c, 85);

    beginShape();
    for (int i = 0; i <= 1600; i++) {
      float t = map(i, 0, 1600, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = ax * damping * sin(fx * t + phase);
      float y = ay * damping * sin(fy * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
  popMatrix();
}
```
:::

### 2. Térbeli görbeszobor

A második kompozíciót egy körpályából építjük fel. Először csak a pályát jelöljük, majd négyzetes keresztmetszeteket helyezünk el rajta. Ezután a keresztmetszeteket elforgatjuk, végül több, eltérő paraméterekkel megadott alakzatot helyezünk ugyanabba a térbeli jelenetbe.

**1. változat – a körpálya megjelenítése.** A pálya vonalát a `vertex(x, y, z)` segítségével állítjuk elő.

:::processing-example title="Térbeli kompozíció – 1. változat" image="media/16-terbeli-kompozicio-1.webp"
```processing
void setup() {
  size(900, 650, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(110, 205, 245);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= 300; i++) {
    float t = TWO_PI * i / 300;
    vertex(185 * cos(t), 185 * sin(t), 0);
  }
  endShape();
}
```
:::

**2. változat – négyzetes keresztmetszetek.** Most a görbe kiválasztott pontjain a négyzetet a pályára merőleges síkban rajzoljuk ki. Még nincs saját csavarodás.

:::processing-example title="Térbeli kompozíció – 2. változat" image="media/17-terbeli-kompozicio-2.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  for (int i = 0; i < 120; i++) {
    float t = TWO_PI * i / 120;
    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

**3. változat – csavarodó keresztmetszetek.** A helyi elforgatás szögét a `t` paraméterből számítjuk. A körbejárás alatt így a négyzet egyszer körbefordul a saját keresztmetszeti síkjában.

:::processing-example title="Térbeli kompozíció – 3. változat" image="media/18-terbeli-kompozicio-3.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  for (int i = 0; i < 150; i++) {
    float t = TWO_PI * i / 150;
    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateY(t);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

**4. változat – több egymásba helyezett szerkezet.** Az ismétlődő rajzolást `drawTwistedRing()` metódusba helyezzük. A paraméterekkel megadható a kör sugara, a négyzet mérete, a körbejárás közbeni csavarodások száma és a szín. Három különböző alakzatot kombinálunk.

:::processing-example title="Térbeli kompozíció – 4. változat" image="media/19-terbeli-kompozicio-4.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  strokeWeight(1.25);

  drawTwistedRing(185, 80, 1,
                  color(95, 200, 250));

  pushMatrix();
  rotateX(0.75);
  drawTwistedRing(137, 57, 2,
                  color(240, 125, 190));
  popMatrix();

  pushMatrix();
  rotateY(0.85);
  drawTwistedRing(92, 39, 3,
                  color(240, 205, 105));
  popMatrix();
}

void drawTwistedRing(float radius,
                     float sectionSize,
                     float twistCount, color c) {
  stroke(c, 110);
  int count = 160;

  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;
    float size = sectionSize *
                 (0.85 + 0.15 * sin(4 * t));

    pushMatrix();
    rotateZ(t);
    translate(radius, 0, 0);
    rotateY(twistCount * t);
    rotateX(HALF_PI);
    rect(0, 0, size, size);
    popMatrix();
  }
}
```
:::

Az alakzatok középpontjai különböző sugarú körökön haladnak, miközben a keresztmetszetek elfordulnak és kissé méretet is változtatnak. A jelenet lassú forgatása segít felismerni a térbeli szerkezetet. A program nem számít felületet a keresztmetszetek közé; a kép egymás mellé rajzolt vonalalakzatokból jön létre.

A fejezet példái ugyanazt a gondolatot használják eltérő módon: a paraméterből meghatározzuk a helyet, majd szükség esetén ugyanebből a paraméterből számítjuk a méretet, az irányt vagy a színt. Így egyetlen változó több tulajdonságot is egységesen szabályozhat.
